import ExcelUploader from '@/components/excel-uploader'
import { Footer } from '@/components/footer'
import Header from '@/components/header'
import React from 'react'

const Page = () => {
  return (
    <>
    <Header />
    <div className='mx-auto px-4 py-8 bg-[linear-gradient(60deg,_rgb(247,_149,_51),_rgb(243,_112,_85),_rgb(239,_78,_123),_rgb(161,_102,_171),_rgb(80,_115,_184),_rgb(16,_152,_173),_rgb(7,_179,_155),_rgb(111,_186,_130))] min-h-[80vh]'>
      <h1 className="text-3xl font-bold text-gray-200 mb-6 text-center">Add Excels here</h1>
        
        <ExcelUploader/>
    </div>
    <Footer/>
    </>
  )
}

export default Page