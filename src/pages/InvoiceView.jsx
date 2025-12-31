import React from 'react';
import { BookOpen, Printer, ArrowLeft } from 'lucide-react';

export default function InvoiceView({ data, onHome }) {
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="bg-gray-800 text-white p-8 flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
               <BookOpen className="h-8 w-8 text-blue-400 mr-2" />
               <span className="font-bold text-2xl tracking-tighter">MAPA</span>
            </div>
            <p className="text-gray-400 text-sm">Jl. Pendidikan No. 123, Jakarta</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold uppercase tracking-wide text-blue-400">Invoice</h1>
            <p className="text-lg font-medium mt-1">{data.no}</p>
            <div className="mt-4">
              <p className="text-sm text-gray-400">Jatuh Tempo: <span className="text-white font-medium">{data.dueDate}</span></p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-8 border-b flex justify-between items-start">
          <div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Tagihan Kepada</h3>
            <p className="text-xl font-bold text-gray-900">{data.student.name}</p>
            <p className="text-gray-600">Kelas: {data.student.kelas} ({data.student.jenjang})</p>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold uppercase">Menunggu Pembayaran</span>
        </div>

        {/* Table */}
        <div className="p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200"><th className="py-3 text-gray-500 uppercase">Deskripsi</th><th className="py-3 text-right text-gray-500 uppercase">Jumlah</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4"><p className="font-bold">{data.package.title}</p></td>
                <td className="py-4 text-right">Rp {Number(data.package.price).toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-4"><p className="font-bold">Biaya Administrasi</p></td>
                <td className="py-4 text-right">Rp {data.adminFee.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-6 text-right font-bold text-gray-600">Total</td>
                <td className="pt-6 text-right font-bold text-3xl text-blue-600">Rp {data.total.toLocaleString('id-ID')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t flex justify-center space-x-4 print:hidden">
          <button onClick={() => window.print()} className="flex items-center px-6 py-3 border rounded-lg font-bold hover:bg-gray-50"><Printer className="w-5 h-5 mr-2" /> Cetak</button>
          <button onClick={onHome} className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"><ArrowLeft className="w-5 h-5 mr-2" /> Beranda</button>
        </div>
      </div>
    </div>
  );
}