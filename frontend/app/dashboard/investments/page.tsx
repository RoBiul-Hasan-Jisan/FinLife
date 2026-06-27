'use client';
import CrudPage from '@/components/CrudPage';
import { BarChart3 } from 'lucide-react';
export default function InvestmentsPage() {
  return <CrudPage title="Investments" endpoint="investments" color="blue" icon={<BarChart3 className="w-5 h-5"/>}
    defaultValues={{name:'',type:'stocks',quantity:1,buyPrice:0,currentPrice:0,platform:''}}
    fields={[
      {key:'name',label:'Asset Name',type:'text',required:true,placeholder:'Apple, Bitcoin...'},
      {key:'ticker',label:'Ticker',type:'text',placeholder:'AAPL, BTC'},
      {key:'type',label:'Type',type:'select',options:['stocks','crypto','bonds','real_estate','mutual_funds','etf','other']},
      {key:'quantity',label:'Quantity',type:'number',required:true,placeholder:'1'},
      {key:'buyPrice',label:'Buy Price',type:'number',required:true,placeholder:'0.00'},
      {key:'currentPrice',label:'Current Price',type:'number',placeholder:'0.00'},
      {key:'platform',label:'Platform',type:'text',placeholder:'Robinhood, Binance...'},
      {key:'buyDate',label:'Buy Date',type:'date'},
    ]}
    columns={[
      {key:'name',label:'Asset',render:(r:any)=><span>{r.name} {r.ticker?`(${r.ticker})`:''}</span>},
      {key:'type',label:'Type'},
      {key:'quantity',label:'Qty'},
      {key:'buyPrice',label:'Buy Price'},
      {key:'currentPrice',label:'Curr Price'},
      {key:'gainLoss',label:'Gain/Loss',render:(r:any,fmt:any)=>{
        const gain=(r.currentPrice-r.buyPrice)*r.quantity;
        return <span className={gain>=0?'text-green-600':'text-red-500'}>{gain>=0?'+':''}{fmt(gain)}</span>;
      }},
    ]}
    currencyFields={['buyPrice','currentPrice']}/>;
}
