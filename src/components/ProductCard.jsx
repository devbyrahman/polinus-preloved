import { Link } from 'react-router-dom'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

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
    image_urls && image_urls.length > 0
      ? image_urls[0]
      : 'https://placehold.co/600x750/f1f5f9/475569?text=Polinus+Preloved'

  const hasCod = is_cod ?? isCod ?? (cod_preference === 'COD')
  const hasNego = is_negotiable ?? isNegotiable

  // Seluruh kartu dibungkus <Link>, jadi klik di mana saja membuka halaman detail
  return (
    <Link
      to={`/listing/${id}`}
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
    >
      {/* Foto bersih tanpa overlay; aspect-[4/5] = rasio potret */}
      <img
        src={thumbnail}
        alt={title}
        loading="lazy"
        className="aspect-[4/5] w-full rounded-t-xl bg-slate-100 object-cover"
        onError={(e) => {
          e.currentTarget.src =
            'https://placehold.co/600x750/f1f5f9/475569?text=Polinus+Preloved'
        }}
      />

      <div className="p-3">
        {/* line-clamp-2 memotong judul setelah 2 baris */}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-slate-900">{title}</h3>
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
