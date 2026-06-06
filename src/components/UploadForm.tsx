import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

// Category and subcategory options matching the Sanity schema
// Keep English to match website
const CATEGORIES = [
  { value: "concrete", label: "Concrete Work" },
  { value: "outdoor-kitchens", label: "Outdoor Kitchens" },
  { value: "covered-patios", label: "Covered Patios" },
  { value: "pools-spas", label: "Pools & Spas" },
  { value: "fire-features", label: "Fire Features" },
  { value: "landscaping", label: "Landscaping" },
  { value: "iron-work", label: "Iron Work" },
];

const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  concrete: [
    { value: "walkways-steps", label: "Walkways & Steps" },
    { value: "flatwork-patios", label: "Flatwork & Patios" },
    { value: "driveways", label: "Driveways" },
    { value: "stone-work", label: "Stone Work" },
  ],
  landscaping: [
    { value: "turf", label: "Artificial Turf" },
    { value: "gardens", label: "Gardens" },
    { value: "water-features", label: "Water Features" },
  ],
};

type UploadStatus = "idle" | "converting" | "uploading" | "success" | "error";

export default function UploadForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSubcategories =
    category === "concrete" || category === "landscaping";

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a HEIC file (iPhone photos)
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      setStatus("converting");
      try {
        // HeicTo is loaded from CDN in upload.astro
        // Wait for it to be available (max 5 seconds)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let HeicTo = (window as any).HeicTo;
        if (!HeicTo) {
          for (let i = 0; i < 50 && !HeicTo; i++) {
            await new Promise((r) => setTimeout(r, 100));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            HeicTo = (window as any).HeicTo;
          }
        }
        if (!HeicTo) {
          throw new Error("HEIC converter not loaded");
        }
        const blob = await HeicTo({
          blob: file,
          type: "image/jpeg",
          quality: 0.9,
        });

        // Create a new File from the blob
        const convertedFile = new File(
          [blob],
          file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
          { type: "image/jpeg" }
        );

        setImageFile(convertedFile);
        setImagePreview(URL.createObjectURL(blob));
        setStatus("idle");
      } catch (err) {
        console.error("HEIC conversion error:", err);
        setStatus("error");
        setErrorMessage("No se pudo convertir la foto. Intenta con otra.");
      }
    } else {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setTitle("");
    setCategory("");
    setSubcategory("");
    setNotes("");
    setStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!imageFile || !title || !category) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setStatus("uploading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", title);
      formData.append("category", category);
      if (subcategory) {
        formData.append("subcategory", subcategory);
      }
      if (notes) {
        formData.append("notes", notes);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  // Success state
  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="font-['Bebas_Neue'] text-3xl text-white mb-2">
          ¡Listo!
        </h2>
        <p className="text-slate-light mb-8">La foto se agregó a la galería.</p>
        <button
          onClick={resetForm}
          className="bg-bronze hover:bg-bronze-dark text-white font-['Bebas_Neue'] text-lg tracking-wider py-4 px-8 transition-colors"
        >
          Subir Otra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block font-['Bebas_Neue'] text-lg tracking-wide text-white mb-2">
          Foto <span className="text-bronze">*</span>
        </label>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-black"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate rounded-lg cursor-pointer hover:border-bronze transition-colors bg-charcoal">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-slate-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-slate-light">
                <span className="font-semibold text-bronze">
                  Toca para elegir foto
                </span>
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block font-['Bebas_Neue'] text-lg tracking-wide text-white mb-2"
        >
          Título <span className="text-bronze">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ej. Broom finish"
          maxLength={100}
          className="w-full px-4 py-4 bg-charcoal border-2 border-slate rounded-lg text-white placeholder-slate-light focus:border-bronze focus:outline-none transition-colors text-base"
        />
        <p className="text-xs text-slate-light mt-1">{title.length}/100</p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block font-['Bebas_Neue'] text-lg tracking-wide text-white mb-2"
        >
          Categoría <span className="text-bronze">*</span>
        </label>
        <select
          id="category"
          value={category}
          onChange={handleCategoryChange}
          className="w-full px-4 py-4 bg-charcoal border-2 border-slate rounded-lg text-white focus:border-bronze focus:outline-none transition-colors text-base appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B8860B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.5rem",
          }}
        >
          <option value="">Elige...</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory (conditional) */}
      {hasSubcategories && (
        <div>
          <label
            htmlFor="subcategory"
            className="block font-['Bebas_Neue'] text-lg tracking-wide text-white mb-2"
          >
            Subcategoría
          </label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-4 py-4 bg-charcoal border-2 border-slate rounded-lg text-white focus:border-bronze focus:outline-none transition-colors text-base appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B8860B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.5rem",
            }}
          >
            <option value="">Opcional...</option>
            {SUBCATEGORIES[category]?.map((sub) => (
              <option key={sub.value} value={sub.value}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block font-['Bebas_Neue'] text-lg tracking-wide text-white mb-2"
        >
          Notas para Jennifer
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ej. Tipo de trabajo, detalles"
          rows={3}
          maxLength={500}
          className="w-full px-4 py-4 bg-charcoal border-2 border-slate rounded-lg text-white placeholder-slate-light focus:border-bronze focus:outline-none transition-colors text-base resize-none"
        />
        <p className="text-xs text-slate-light mt-1">
          Opcional - escribe detalles del proyecto
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "uploading" || status === "converting"}
        className="w-full bg-bronze hover:bg-bronze-dark disabled:bg-slate disabled:cursor-not-allowed text-white font-['Bebas_Neue'] text-xl tracking-wider py-5 rounded-lg transition-colors"
      >
        {status === "uploading" || status === "converting" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {status === "converting" ? "Convirtiendo..." : "Subiendo..."}
          </span>
        ) : (
          "Subir Foto"
        )}
      </button>
    </form>
  );
}
