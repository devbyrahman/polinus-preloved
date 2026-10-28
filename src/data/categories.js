import {
  LayoutGrid,
  Smartphone,
  BookOpen,
  Utensils,
  Laptop,
  Shirt,
  Sparkles,
  Bike,
  Heart,
  Dumbbell,
  Armchair,
  Ticket,
  MoreHorizontal,
} from 'lucide-react'

export const ALL_CATEGORY = 'Semua'

export const categoryList = [
  { name: 'Gadget & Aksesoris', icon: Smartphone },
  { name: 'Buku & ATK', icon: BookOpen },
  { name: 'Alat Dapur & Makan', icon: Utensils },
  { name: 'Barang Elektronik', icon: Laptop },
  { name: 'Pakaian & Mode', icon: Shirt },
  { name: 'Koleksi & Hobi', icon: Sparkles },
  { name: 'Kendaraan', icon: Bike },
  { name: 'Perawatan & Kecantikan', icon: Heart },
  { name: 'Alat Olahraga', icon: Dumbbell },
  { name: 'Perlengkapan Kos', icon: Armchair },
  { name: 'Tiket & Kupon', icon: Ticket },
  { name: 'Kategori Lainnya', icon: MoreHorizontal },
]

export const allCategoryItem = {
  name: ALL_CATEGORY,
  label: 'Semua Kategori',
  icon: LayoutGrid,
}
