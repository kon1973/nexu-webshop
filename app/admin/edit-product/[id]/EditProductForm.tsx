'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, ProductOption, ProductVariant } from '@prisma/client'
import { updateProductAction } from '../../products/actions'
import { ProductBasicInfo } from '../../components/product-form/ProductBasicInfo'
import { ProductImages } from '../../components/product-form/ProductImages'
import { ProductVariants } from '../../components/product-form/ProductVariants'
import { ProductSpecifications } from '../../components/product-form/ProductSpecifications'
import { ProductDescriptions } from '../../components/product-form/ProductDescriptions'

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

type ProductWithDetails = Product & {
  options: ProductOption[]
  variants: ProductVariant[]
  specifications?: any
}

type Category = {
  id: string
  name: string
}

type SpecTemplate = {
  id: string
  name: string
  fields: { name: string, type: 'text' | 'boolean' | 'header' }[]
}

type Props = {
  product: ProductWithDetails
  initialCategories: Category[]
  initialAttributes: Attribute[]
  initialSpecTemplates: SpecTemplate[]
}

export default function EditProductForm({ product, initialCategories, initialAttributes, initialSpecTemplates }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>(product.images && product.images.length > 0 ? product.images : [product.image])
  const [uploading, setUploading] = useState(false)
  const [variantUploading, setVariantUploading] = useState<string | null>(null)
  
  // Attributes state
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(initialAttributes)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [basePrice, setBasePrice] = useState<number>(product.price)
  const [baseStock, setBaseStock] = useState<number>(product.stock)
  const [isArchived, setIsArchived] = useState<boolean>((product as any).isArchived || false)
  
  // Basic Info State
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [fullDescription, setFullDescription] = useState((product as any).fullDescription || '')
  const [categoryId, setCategoryId] = useState(product.category)

  // Sale state
  const [saleType, setSaleType] = useState<'FIXED' | 'PERCENTAGE'>(product.salePercentage ? 'PERCENTAGE' : 'FIXED')
  const [salePrice, setSalePrice] = useState<number | ''>(product.salePrice || '')
  const [salePercentage, setSalePercentage] = useState<number | ''>(product.salePercentage || '')
  const [saleStartDate, setSaleStartDate] = useState<string>(product.saleStartDate ? new Date(product.saleStartDate).toISOString().split('T')[0] : '')
  const [saleEndDate, setSaleEndDate] = useState<string>(product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : '')

  // Effect to calculate sale price when percentage changes or base price changes
  useEffect(() => {
    if (saleType === 'PERCENTAGE' && typeof salePercentage === 'number' && salePercentage > 0) {
      const calculated = Math.round(basePrice * (1 - salePercentage / 100))
      setSalePrice(calculated)
    }
  }, [salePercentage, basePrice, saleType])

  // Specifications state
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>(initialSpecTemplates)
  const [specifications, setSpecifications] = useState<{ key: string, value: string | boolean, type: 'text' | 'boolean' | 'header' }[]>([])

  useEffect(() => {
    // Initialize variants and attributes from product
    if (product.variants && product.variants.length > 0) {
      const mappedVariants = product.variants.map((v: ProductVariant) => ({
        id: v.id,
        attributes: v.attributes as Record<string, string>,
        price: v.price,
        salePrice: v.salePrice,
        salePercentage: v.salePercentage,
        saleStartDate: v.saleStartDate ? new Date(v.saleStartDate).toISOString().split('T')[0] : null,
        saleEndDate: v.saleEndDate ? new Date(v.saleEndDate).toISOString().split('T')[0] : null,
        stock: v.stock,
        sku: v.sku || '',
        image: (v.images && v.images.length > 0 ? v.images[0] : '') || '',
        description: v.description || '',
        isActive: (v as any).isActive ?? true
      }))
      setVariants(mappedVariants)
    }

    if (Array.isArray(product.specifications)) {
      // Ensure type exists for old data
      const specs = (product.specifications as any[]).map(s => ({
        ...s,
        type: s.type || 'text'
      }))
      setSpecifications(specs)
    }
  }, [])

  useEffect(() => {
    if (availableAttributes.length > 0 && product.options) {
      const ids = product.options.map((opt: ProductOption) => {
        const found = availableAttributes.find(a => a.name === opt.name)
        return found ? found.id : null
      }).filter(Boolean) as string[]
      // Only set if not already set (to avoid overwriting user changes if they happen fast)
      if (selectedAttributeIds.length === 0 && ids.length > 0) {
        setSelectedAttributeIds(ids)
      }
    }
  }, [availableAttributes, product.options])

  const applySpecTemplate = (templateId: string) => {
    const template = specTemplates.find(t => t.id === templateId)
    if (!template) return

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
      if (confirm('Biztosan törölni szeretnéd az összes variációt?')) {
        setVariants([])
      }
      return
    }

    if (variants.length > 0) {
      if (!confirm('A variációk újragenerálása törli a jelenlegi beállításokat (készlet, árak). Folytatod?')) {
        return
      }
    }

    // Generate combinations
    const combinations = cartesianProduct(selectedAttrs)
    
    const newVariants: Variant[] = combinations.map((combo, idx) => ({
      id: `new-${idx}`,
      attributes: combo,
      price: basePrice || 0,
      salePrice: salePrice === '' ? null : Number(salePrice),
      salePercentage: salePercentage === '' ? null : Number(salePercentage),
      saleStartDate: saleStartDate || null,
      saleEndDate: saleEndDate || null,
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
      name: formData.get('name'),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      salePrice: salePrice === '' ? null : Number(salePrice),
      salePercentage: salePercentage === '' ? null : Number(salePercentage),
      saleStartDate: saleStartDate ? new Date(saleStartDate).toISOString() : null,
      saleEndDate: saleEndDate ? new Date(saleEndDate).toISOString() : null,
      description: formData.get('description'),
      fullDescription: formData.get('fullDescription'),
      image: images[0] || '\u{1f4e6}',
      images: images,
      isArchived: isArchived,
      specifications: specifications.filter(s => {
        if (!s.key) return false
        if (s.type === 'header') return true
        if (s.type === 'boolean') return s.value !== undefined && s.value !== null
        return s.value !== undefined && s.value !== ''
      }),
      variants: variants.map(v => ({
        id: v.id.startsWith('new-') ? undefined : v.id, // Only send ID if it's an existing variant
        attributes: v.attributes,
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        salePercentage: v.salePercentage ? Number(v.salePercentage) : null,
        saleStartDate: v.saleStartDate ? new Date(v.saleStartDate).toISOString() : null,
        saleEndDate: v.saleEndDate ? new Date(v.saleEndDate).toISOString() : null,
        stock: Number(v.stock),
        sku: v.sku,
        image: v.image,
        description: v.description,
        isActive: v.isActive
      }))
    }

    try {
      // @ts-ignore
      const res = await updateProductAction(product.id, productData)

      if (res.success) {
        toast.success('Termék sikeresen frissítve!')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast.error(res.error || 'Hiba történt a mentéskor.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba történt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">Termék szerkesztése</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
            <ProductBasicInfo
              categories={categories}
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
              {isSubmitting ? 'Mentés folyamatban...' : 'Módosítások mentése'}
            </button>
        </form>
      </div>
    </div>
  )
}
