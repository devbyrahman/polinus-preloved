import { Link } from 'react-router-dom'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='600' fill='%2394a3b8'%3EPolinus Preloved%3C/text%3E%3C/svg%3E"

// Badge pill versi terang: latar biru muda, teks biru
function Badge({ children }) {
  return (
    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
      {children}
    </span>
  )
}

export default function ProductCard({ product }) {
  const {
    id,
    title,
    price,
    condition,
    is_cod,
    isCod,
    cod_preference,
    is_negotiable,
    isNegotiable,
    image_urls,
  } = product

  const thumbnail =
    image_urls && image_urls.length > 0 ? image_urls[0] : FALLBACK_IMAGE

  const hasCod = is_cod ?? isCod ?? (cod_preference === 'COD')
  const hasNego = is_negotiable ?? isNegotiable

  // Seluruh kartu dibungkus <Link>, jadi klik di mana saja membuka halaman detail
  return (
    <Link
      to={`/listing/${id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
    >
      {/* Foto bersih tanpa overlay; aspect-[4/5] = rasio potret, loading lazy & async */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </div>

      <div className="p-3">
        {/* line-clamp-2 memotong judul setelah 2 baris */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-slate-900 group-hover:text-blue-900 transition-colors">
          {title}
        </h3>
        <p className="mt-2 font-bold text-slate-900">{formatRupiah(price)}</p>

        {/* Badge di bawah harga, flex-wrap agar turun baris jika sempit */}
        <div className="mt-2 flex flex-wrap gap-1">
          {condition && <Badge>{condition}</Badge>}
          {hasCod && <Badge>COD</Badge>}
          {hasNego && <Badge>Bisa Nego</Badge>}
        </div>
      </div>
    </Link>
  )
}
