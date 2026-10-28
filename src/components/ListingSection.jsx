import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

// Section katalog yang bisa dipakai ulang: judul + link "Lihat semua" + grid 6 kolom
export default function ListingSection({ title, subtitle, listings, linkTo = '/katalog' }) {
  return (
    <section className="py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <Link to={linkTo} className="shrink-0 text-sm font-medium text-blue-900 hover:underline">
          Lihat semua
        </Link>
      </div>

      {/* 2 kolom (mobile) -> 3 (md) -> 6 (xl), jarak antar kartu 16px */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {listings.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  )
}
