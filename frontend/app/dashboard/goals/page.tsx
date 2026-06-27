'use client';
import CrudPage from '@/components/CrudPage';
import { Target } from 'lucide-react';
export default function GoalsPage() {
  return <CrudPage title="Savings Goals" endpoint="goals" color="purple" icon={<Target className="w-5 h-5"/>}
    defaultValues={{title:'',targetAmount:0,currentAmount:0,icon:'🎯',status:'active'}}
    fields={[
      {key:'title',label:'Goal Title',type:'text',required:true,placeholder:'Emergency Fund...'},
      {key:'icon',label:'Icon (emoji)',type:'text',placeholder:'🎯'},
      {key:'targetAmount',label:'Target Amount',type:'number',required:true,placeholder:'10000'},
      {key:'currentAmount',label:'Current Amount',type:'number',placeholder:'0'},
      {key:'deadline',label:'Deadline',type:'date'},
      {key:'notes',label:'Notes',type:'textarea',placeholder:'Optional...'},
      {key:'status',label:'Status',type:'select',options:['active','paused','completed']},
    ]}
    columns={[
      {key:'title',label:'Goal',render:(r:any)=><span>{r.icon} {r.title}</span>},
      {key:'currentAmount',label:'Current'},
      {key:'targetAmount',label:'Target'},
      {key:'status',label:'Status',render:(r:any)=>(
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status==='completed'?'bg-green-100 text-green-700':r.status==='paused'?'bg-yellow-100 text-yellow-700':'bg-indigo-100 text-indigo-700'}`}>{r.status}</span>
      )},
    ]}
    currencyFields={['currentAmount','targetAmount']}/>;
}
