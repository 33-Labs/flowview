import Layout from "../../components/common/Layout";

export default function Account() {
  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <div hidden className="text-green-800  bg-green-100"></div>
      <div hidden className="text-blue-800 bg-blue-100"></div>
      <div hidden className="text-rose-800 bg-rose-100"></div>
      <div hidden className="text-yellow-800 bg-yellow-100"></div>
      <div hidden className="text-teal-800 bg-teal-100"></div>
      <div hidden className="text-indigo-800 bg-indigo-100"></div>
      <div hidden className="text-slate-800 bg-slate-100"></div>
      <Layout>Home</Layout>
    </div>
  )
}