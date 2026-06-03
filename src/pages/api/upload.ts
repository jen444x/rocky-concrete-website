import type { APIRoute } from 'astro'
import { sanityWriteClient } from '../../sanity/client'
import { AUTH_COOKIE, authToken } from './verify-password'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Require a valid login cookie before doing anything. This is the real
    // gate — the password check in the UI is just convenience on top of this.
    const uploadPassword = import.meta.env.UPLOAD_PASSWORD
    const provided = cookies.get(AUTH_COOKIE)?.value
    if (!uploadPassword || provided !== authToken(uploadPassword)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if write client has token configured
    if (!import.meta.env.SANITY_WRITE_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Sanity token' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const title = formData.get('title') as string | null
    const category = formData.get('category') as string | null
    const subcategory = formData.get('subcategory') as string | null
    const notes = formData.get('notes') as string | null

    // Validate required fields
    if (!imageFile || !title || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: image, title, and category are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Convert File to Buffer for Sanity upload
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload image to Sanity
    const imageAsset = await sanityWriteClient.assets.upload('image', buffer, {
      filename: imageFile.name,
      contentType: imageFile.type,
    })

    // Create the gallery item document
    const galleryItem = {
      _type: 'galleryItem',
      title: title.trim(),
      alt: title.trim(), // Auto-copy title to alt text
      category: category,
      ...(subcategory && { subcategory }), // Only include if provided
      ...(notes && { notes: notes.trim() }), // Only include if provided
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      featured: false,
    }

    const createdDoc = await sanityWriteClient.create(galleryItem)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Photo uploaded successfully',
        id: createdDoc._id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Upload error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return new Response(
      JSON.stringify({ error: `Upload failed: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
