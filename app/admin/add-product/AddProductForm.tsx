'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProductBasicInfo } from '../components/product-form/ProductBasicInfo'
import { ProductImages } from '../components/product-form/ProductImages'
import { ProductVariants } from '../components/product-form/ProductVariants'
import { ProductSpecifications } from '../components/product-form/ProductSpecifications'
import { ProductDescriptions } from '../components/product-form/ProductDescriptions'
import { createProductAction } from '../products/actions'

type Attribute = {
  id: string
  name: string
  values: string[]
}

type Variant = {
  id: string
  attributes: Record<string, string>
  price: number
  salePrice?: number | null
  salePercentage?: number | null
  saleStartDate?: string | null
  saleEndDate?: string | null
  stock: number
  sku?: string
  image?: string
  description?: string
  isActive: boolean
}

type SpecTemplate = {
  id: string
  name: string
  fields: { name: string, type: 'text' | 'boolean' | 'header' }[]
}

type Category = {
  id: string
  name: string
}

type Brand = {
  id: string
  name: string
  logo?: string | null
}

type Props = {
  initialCategories: Category[]
  initialAttributes: Attribute[]
  initialSpecTemplates: any[] // Using any for now as the type from service might be complex
  initialBrands: Brand[]
}

export default function AddProductForm({ initialCategories, initialAttributes, initialSpecTemplates, initialBrands }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [variantUploading, setVariantUploading] = useState<string | null>(null)
  
  // Attributes state
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(initialAttributes)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [brands] = useState<Brand[]>(initialBrands)
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [basePrice, setBasePrice] = useState<number>(0)
  const [baseStock, setBaseStock] = useState<number>(0)
  const [isArchived, setIsArchived] = useState(false)

  // Basic Info State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')

  // Sale State
  const [saleType, setSaleType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED')
  const [salePrice, setSalePrice] = useState<number | ''>('')
  const [salePercentage, setSalePercentage] = useState<number | ''>('')
  const [saleStartDate, setSaleStartDate] = useState('')
  const [saleEndDate, setSaleEndDate] = useState('')

  // Specifications state
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>(initialSpecTemplates)
  const [specifications, setSpecifications] = useState<{ key: string, value: string | boolean, type: 'text' | 'boolean' | 'header' }[]>([])

  // Removed useEffect fetching


  const applySpecTemplate = (templateId: string) => {
    const template = specTemplates.find(t => t.id === templateId)
    if (!template) return

    // Merge new fields with existing ones, avoiding duplicates if key exists
    const newSpecs = [...specifications]
    template.fields.forEach(field => {
      if (!newSpecs.some(s => s.key === field.name)) {
        newSpecs.push({ 
          key: field.name, 
          value: field.type === 'boolean' ? false : '', 
          type: field.type 
        })
      }
    })
    setSpecifications(newSpecs)
  }

  const addSpecRow = () => {
    setSpecifications([...specifications, { key: '', value: '', type: 'text' }])
  }

  const removeSpecRow = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const updateSpec = (index: number, field: 'key' | 'value' | 'type', val: any) => {
    const newSpecs = [...specifications]
    // @ts-ignore
    newSpecs[index][field] = val
    setSpecifications(newSpecs)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)

    try {
      for (const file of Array.from(e.target.files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          setImages((prev) => [...prev, data.url])
        } else {
          toast.error(`Hiba a feltöltéskor: ${file.name}`)
        }
      }
    } catch (error) {
      toast.error('Hiba történt a feltöltéskor')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleAttribute = (id: string) => {
    setSelectedAttributeIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const generateVariants = () => {
    const selectedAttrs = availableAttributes.filter(a => selectedAttributeIds.includes(a.id))
    
    if (selectedAttrs.length === 0) {
      setVariants([])
      return
    }

    // Generate combinations
    const combinations = cartesianProduct(selectedAttrs)
    
    const newVariants: Variant[] = combinations.map((combo, idx) => ({
      id: `new-${idx}`,
      attributes: combo,
      price: basePrice || 0,
      stock: baseStock || 0,
      sku: '',
      image: images[0] || '',
      description: '',
      isActive: true
    }))

    setVariants(newVariants)
    toast.success(`${newVariants.length} variáció generálva`)
  }

  const cartesianProduct = (attributes: Attribute[]): Record<string, string>[] => {
    if (attributes.length === 0) return []

    const [first, ...rest] = attributes
    
    if (rest.length === 0) {
      return first.values.map(val => ({ [first.name]: val }))
    }

    const restCombinations = cartesianProduct(rest)
    const result = []

    for (const val of first.values) {
      for (const combo of restCombinations) {
        result.push({ [first.name]: val, ...combo })
      }
    }

    return result
  }

  const handleVariantImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setVariantUploading(variants[index].id)

    try {
      const file = e.target.files[0]
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        updateVariant(index, 'image', data.url)
        toast.success('Variáció képe feltöltve')
      } else {
        toast.error(`Hiba a feltöltéskor: ${file.name}`)
      }
    } catch (error) {
      toast.error('Hiba történt a feltöltéskor')
    } finally {
      setVariantUploading(null)
    }
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    setVariants(newVariants)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      description: formData.get('description') as string,
      fullDescription: formData.get('fullDescription') as string,
      image: images[0] || '\u{1f4e6}',
      images: images,
      isArchived: isArchived,
      brandId: brandId || null,
      specifications: specifications.filter(s => s.key && (s.type === 'header' || s.value !== '')),
      variants: variants.map(v => ({
        attributes: v.attributes,
        price: Number(v.price),
        stock: Number(v.stock),
        sku: v.sku,
        image: v.image,
        description: v.description,
        isActive: v.isActive
      })),
      options: []
    }

    try {
      const result = await createProductAction(productData)

      if (result.success) {
        toast.success('Termék sikeresen létrehozva!')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error(result.error || 'Hiba történt a mentéskor.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba történt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Plus className="text-purple-500" /> Új termék feltöltése
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <ProductBasicInfo
              categories={categories}
              brands={brands}
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              baseStock={baseStock}
              setBaseStock={setBaseStock}
              isArchived={isArchived}
              setIsArchived={setIsArchived}
              variantsCount={variants.length}
              variantsStockSum={variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)}
              name={name}
              setName={setName}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              brandId={brandId}
              setBrandId={setBrandId}
              saleType={saleType}
              setSaleType={setSaleType}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
              salePercentage={salePercentage}
              setSalePercentage={setSalePercentage}
              saleStartDate={saleStartDate}
              setSaleStartDate={setSaleStartDate}
              saleEndDate={saleEndDate}
              setSaleEndDate={setSaleEndDate}
            />

            <ProductImages
              images={images}
              uploading={uploading}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />

            <ProductDescriptions
              description={description}
              setDescription={setDescription}
              fullDescription={fullDescription}
              setFullDescription={setFullDescription}
            />

            <ProductVariants
              variants={variants}
              availableAttributes={availableAttributes}
              selectedAttributeIds={selectedAttributeIds}
              toggleAttribute={toggleAttribute}
              generateVariants={generateVariants}
              updateVariant={updateVariant}
              variantUploading={variantUploading}
              handleVariantImageUpload={handleVariantImageUpload}
              removeVariant={removeVariant}
            />

            <ProductSpecifications
              specifications={specifications}
              specTemplates={specTemplates}
              applySpecTemplate={applySpecTemplate}
              addSpecRow={addSpecRow}
              removeSpecRow={removeSpecRow}
              updateSpec={updateSpec}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {isSubmitting ? 'Mentés folyamatban...' : 'Termék mentése'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


