import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './src/sanity/schemaTypes'

// Custom structure for organizing gallery items by category
const structure = (S: any, context: any) =>
  S.list()
    .title('Content')
    .items([
      // Drag-and-drop reordering BY CATEGORY
      S.listItem()
        .title('↕️ Reorder Gallery')
        .child(
          S.list()
            .title('Reorder by Category')
            .items([
              // CONCRETE - has subcategories
              S.listItem()
                .title('Concrete')
                .child(
                  S.list()
                    .title('Concrete Subcategories')
                    .items([
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-walkways-steps',
                        title: 'Walkways & Steps',
                        filter: 'category == "concrete" && subcategory == "walkways-steps"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-flatwork-patios',
                        title: 'Flatwork & Patios',
                        filter: 'category == "concrete" && subcategory == "flatwork-patios"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-stone-work',
                        title: 'Stone Work',
                        filter: 'category == "concrete" && subcategory == "stone-work"',
                        S,
                        context,
                      }),
                    ])
                ),
              // OUTDOOR KITCHENS - no subcategories
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                id: 'orderable-outdoor-kitchens',
                title: 'Outdoor Kitchens',
                filter: 'category == "outdoor-kitchens"',
                S,
                context,
              }),
              // COVERED PATIOS - no subcategories
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                id: 'orderable-covered-patios',
                title: 'Covered Patios',
                filter: 'category == "covered-patios"',
                S,
                context,
              }),
              // FIRE FEATURES - has subcategories
              S.listItem()
                .title('Fire Features')
                .child(
                  S.list()
                    .title('Fire Features Subcategories')
                    .items([
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-fire-pits',
                        title: 'Fire Pits',
                        filter: 'category == "fire-features" && subcategory == "fire-pits"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-fire-pit-tables',
                        title: 'Fire Pit Tables',
                        filter: 'category == "fire-features" && subcategory == "fire-pit-tables"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-fireplaces',
                        title: 'Fireplaces',
                        filter: 'category == "fire-features" && subcategory == "fireplaces"',
                        S,
                        context,
                      }),
                    ])
                ),
              // LANDSCAPING - has subcategories
              S.listItem()
                .title('Landscaping')
                .child(
                  S.list()
                    .title('Landscaping Subcategories')
                    .items([
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-gardens',
                        title: 'Gardens & Lawns',
                        filter: 'category == "landscaping" && subcategory == "gardens"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-water-features',
                        title: 'Water Features',
                        filter: 'category == "landscaping" && subcategory == "water-features"',
                        S,
                        context,
                      }),
                      orderableDocumentListDeskItem({
                        type: 'galleryItem',
                        id: 'orderable-turf',
                        title: 'Artificial Turf',
                        filter: 'category == "landscaping" && subcategory == "turf"',
                        S,
                        context,
                      }),
                    ])
                ),
              // IRON WORK - no subcategories
              orderableDocumentListDeskItem({
                type: 'galleryItem',
                id: 'orderable-iron-work',
                title: 'Iron Work',
                filter: 'category == "iron-work"',
                S,
                context,
              }),
            ])
        ),

      S.divider(),

      // All Gallery Items (with sorting)
      S.listItem()
        .title('All Gallery Items')
        .child(
          S.documentList()
            .title('All Gallery Items')
            .filter('_type == "galleryItem"')
            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
        ),

      S.divider(),

      // Gallery by Category
      S.listItem()
        .title('By Category')
        .child(
          S.list()
            .title('Categories')
            .items([
              S.listItem()
                .title('Concrete')
                .child(
                  S.list()
                    .title('Concrete')
                    .items([
                      S.listItem()
                        .title('All Concrete')
                        .child(
                          S.documentList()
                            .title('All Concrete')
                            .filter('_type == "galleryItem" && category == "concrete"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Walkways & Steps')
                        .child(
                          S.documentList()
                            .title('Walkways & Steps')
                            .filter('_type == "galleryItem" && category == "concrete" && subcategory == "walkways-steps"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Flatwork & Patios')
                        .child(
                          S.documentList()
                            .title('Flatwork & Patios')
                            .filter('_type == "galleryItem" && category == "concrete" && subcategory == "flatwork-patios"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Stone Work')
                        .child(
                          S.documentList()
                            .title('Stone Work')
                            .filter('_type == "galleryItem" && category == "concrete" && subcategory == "stone-work"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                    ])
                ),
              S.listItem()
                .title('Outdoor Kitchens')
                .child(
                  S.documentList()
                    .title('Outdoor Kitchens')
                    .filter('_type == "galleryItem" && category == "outdoor-kitchens"')
                    .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                ),
              S.listItem()
                .title('Covered Patios')
                .child(
                  S.documentList()
                    .title('Covered Patios')
                    .filter('_type == "galleryItem" && category == "covered-patios"')
                    .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                ),
              S.listItem()
                .title('Fire Features')
                .child(
                  S.list()
                    .title('Fire Features')
                    .items([
                      S.listItem()
                        .title('All Fire Features')
                        .child(
                          S.documentList()
                            .title('All Fire Features')
                            .filter('_type == "galleryItem" && category == "fire-features"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Fire Pits')
                        .child(
                          S.documentList()
                            .title('Fire Pits')
                            .filter('_type == "galleryItem" && category == "fire-features" && subcategory == "fire-pits"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Fire Pit Tables')
                        .child(
                          S.documentList()
                            .title('Fire Pit Tables')
                            .filter('_type == "galleryItem" && category == "fire-features" && subcategory == "fire-pit-tables"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Fireplaces')
                        .child(
                          S.documentList()
                            .title('Fireplaces')
                            .filter('_type == "galleryItem" && category == "fire-features" && subcategory == "fireplaces"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                    ])
                ),
              S.listItem()
                .title('Landscaping')
                .child(
                  S.list()
                    .title('Landscaping')
                    .items([
                      S.listItem()
                        .title('All Landscaping')
                        .child(
                          S.documentList()
                            .title('All Landscaping')
                            .filter('_type == "galleryItem" && category == "landscaping"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Gardens & Lawns')
                        .child(
                          S.documentList()
                            .title('Gardens & Lawns')
                            .filter('_type == "galleryItem" && category == "landscaping" && subcategory == "gardens"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Water Features')
                        .child(
                          S.documentList()
                            .title('Water Features')
                            .filter('_type == "galleryItem" && category == "landscaping" && subcategory == "water-features"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                      S.listItem()
                        .title('Artificial Turf')
                        .child(
                          S.documentList()
                            .title('Artificial Turf')
                            .filter('_type == "galleryItem" && category == "landscaping" && subcategory == "turf"')
                            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                        ),
                    ])
                ),
              S.listItem()
                .title('Iron Work')
                .child(
                  S.documentList()
                    .title('Iron Work')
                    .filter('_type == "galleryItem" && category == "iron-work"')
                    .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                ),
            ])
        ),

      S.divider(),

      // Featured Items (quick access)
      S.listItem()
        .title('Featured Items')
        .child(
          S.documentList()
            .title('Featured Items')
            .filter('_type == "galleryItem" && featured == true')
            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
        ),

      S.divider(),

      // Category Covers (separate docs for homepage vs gallery)
      S.listItem()
        .title('Category Covers')
        .child(
          S.list()
            .title('Category Covers')
            .items([
              S.listItem()
                .title('Homepage')
                .child(
                  S.document()
                    .schemaType('homepageCovers')
                    .documentId('homepageCovers')
                    .title('Homepage Service Cards')
                ),
              S.listItem()
                .title('Gallery')
                .child(
                  S.document()
                    .schemaType('galleryCovers')
                    .documentId('galleryCovers')
                    .title('Gallery Page Cards')
                ),
            ])
        ),

      // Site Images (hero, about us, etc.)
      S.listItem()
        .title('Site Images')
        .child(
          S.document()
            .schemaType('siteImages')
            .documentId('siteImages')
            .title('Site Images')
        ),
    ])

export default defineConfig({
  name: 'rocky-concrete',
  title: 'Rocky Concrete',

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,

  plugins: [
    structureTool({ structure }),
    muxInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
