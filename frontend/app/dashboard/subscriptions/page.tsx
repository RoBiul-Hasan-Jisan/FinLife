'use client';
import CrudPage from '@/components/CrudPage';
import { CreditCard } from 'lucide-react';
export default function SubscriptionsPage() {
  return <CrudPage title="Subscriptions" endpoint="subscriptions" color="indigo" icon={<CreditCard className="w-5 h-5"/>}
    defaultValues={{name:'',amount:0,billingCycle:'monthly',category:'Entertainment',status:'active',icon:'📦'}}
    fields={[
      {key:'name',label:'Service Name',type:'text',required:true,placeholder:'Netflix, Spotify...'},
      {key:'icon',label:'Icon (emoji)',type:'text',placeholder:'📦'},
      {key:'amount',label:'Amount',type:'number',required:true,placeholder:'9.99'},
      {key:'billingCycle',label:'Billing Cycle',type:'select',options:['monthly','yearly','weekly','quarterly']},
      {key:'category',label:'Category',type:'text',placeholder:'Entertainment, Tools...'},
      {key:'nextBillingDate',label:'Next Billing Date',type:'date'},
      {key:'url',label:'Website URL',type:'text',placeholder:'https://...'},
      {key:'status',label:'Status',type:'select',options:['active','paused','cancelled']},
    ]}
    columns={[
      {key:'name',label:'Service',render:(r:any)=><span>{r.icon} {r.name}</span>},
      {key:'amount',label:'Amount'},
      {key:'billingCycle',label:'Cycle'},
      {key:'nextBillingDate',label:'Next Bill'},
      {key:'status',label:'Status',render:(r:any)=>(
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status==='active'?'bg-green-100 text-green-700':r.status==='paused'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>{r.status}</span>
      )},
    ]}
    currencyFields={['amount']}/>;
}
