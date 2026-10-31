import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Percent, Receipt, Box, Search, Plus,
  Pencil, Power, Trash2, X, ShoppingBag, CircleDollarSign,
  CheckCircle2, AlertCircle, ArrowUpRight, Menu
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Products from "./pages/products";

type Plan = { id:number; name:string; productId:number; frequency:"Daily"|"Weekly"|"Monthly"|"Yearly"; price:number; minQuantity:number; from:string; to:string; active:boolean; description:string };
type Discount = { id:number; name:string; type:"Percentage"|"Fixed"; value:number; appliesTo:"All"|"Product"|"Plan"; targetId:number|null; from:string; to:string; active:boolean };
type Tax = { id:number; name:string; rate:number; active:boolean };
type ProductOption = { id:number; name:string; active?:boolean; status?:string };
const seedProducts:ProductOption[]=[{id:1,name:"Basic Subscription",active:true,status:"Active"},{id:2,name:"Premium Package",active:true,status:"Active"},{id:3,name:"Enterprise Plan",active:true,status:"Active"},{id:4,name:"Wireless Keyboard",active:false,status:"Archived"}];
const seedPlans:Plan[]=[
 {id:1,name:"Basic Monthly",productId:1,frequency:"Monthly",price:499,minQuantity:1,from:"",to:"",active:true,description:"Essential monthly subscription"},
 {id:2,name:"Premium Annual",productId:2,frequency:"Yearly",price:14990,minQuantity:1,from:"",to:"",active:true,description:"Premium annual subscription"},
];
const seedDiscounts:Discount[]=[
 {id:1,name:"Welcome 10%",type:"Percentage",value:10,appliesTo:"All",targetId:null,from:"",to:"",active:true},
 {id:2,name:"Launch Offer",type:"Fixed",value:250,appliesTo:"Product",targetId:1,from:"",to:"",active:true},
];
const seedTaxes:Tax[]=[{id:1,name:"GST",rate:18,active:true}];
function readStore<T,>(key:string, fallback:T):T { try { const value=localStorage.getItem(key); return value?JSON.parse(value) as T:fallback; } catch { return fallback; } }
function useStoredState<T,>(key:string, initial:T) {
 const [value,setValue]=useState<T>(()=>readStore(key,initial));
 useEffect(()=>{localStorage.setItem(key,JSON.stringify(value));},[key,value]);
 return [value,setValue] as const;
}
const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
const navItems=[
 {label:"Dashboard",to:"/",icon:LayoutDashboard},
 {label:"Products",to:"/products",icon:Package},
 {label:"Subscription Plans",to:"/plans",icon:ShoppingBag},
 {label:"Discounts",to:"/discounts",icon:Percent},
 {label:"Tax Settings",to:"/taxes",icon:Receipt},
];
function Shell(){
 const location=useLocation(); const [mobileOpen,setMobileOpen]=useState(false);
 const title=navItems.find(n=>n.to===location.pathname)?.label??"Catalogue";
 return <div className="min-h-screen bg-[#E3DAC9] text-slate-800">
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
   <Brand/>
   <div className="px-4 pt-7"><p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p><nav className="space-y-1">{navItems.map(item=>{const Icon=item.icon;return <NavLink key={item.to} to={item.to} end={item.to==="/"} className={({isActive})=>`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive?"bg-violet-50 font-semibold text-violet-700":"text-slate-600 hover:bg-slate-50"}`}><Icon size={19}/>{item.label}</NavLink>})}</nav></div>
   <div className="mt-auto border-t border-slate-100 p-5"><p className="text-xs text-slate-400">Brightloop · Team Syntax</p><p className="mt-1 text-xs text-slate-500">Catalogue & Pricing</p></div>
  </aside>
  {mobileOpen&&<div className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" onClick={()=>setMobileOpen(false)}><div className="h-full w-72 bg-white" onClick={e=>e.stopPropagation()}><Brand/><nav className="space-y-1 p-4">{navItems.map(item=>{const Icon=item.icon;return <NavLink onClick={()=>setMobileOpen(false)} key={item.to} to={item.to} end={item.to==="/"} className={({isActive})=>`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${isActive?"bg-violet-50 font-semibold text-violet-700":"text-slate-600"}`}><Icon size={19}/>{item.label}</NavLink>})}</nav></div></div>}
  <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><span className="text-sm text-slate-500">Workspace /</span><span className="text-sm font-semibold text-slate-800">{title}</span></div><div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">Admin workspace</span><div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">AD</div></div></header>
   <main className="mx-auto max-w-[1440px] p-5 sm:p-8"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/products" element={<Products/>}/><Route path="/plans" element={<PlansPage/>}/><Route path="/discounts" element={<DiscountsPage/>}/><Route path="/taxes" element={<TaxesPage/>}/><Route path="*" element={<Dashboard/>}/></Routes></main>
   <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-400">Syntax Odoo · Product Catalogue & Pricing <span className="float-right">Demo data is stored in this browser</span></footer>
  </div></div>
; 
}
function Brand(){return <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white"><Box size={21}/></div><div><h1 className="text-base font-bold tracking-tight">Syntax Odoo</h1><p className="text-xs text-slate-500">Subscription Manager</p></div></div>}
function Dashboard(){
 const [plans]=useStoredState<Plan[]>("syntax-plans-v1",seedPlans); const [discounts]=useStoredState<Discount[]>("syntax-discounts-v1",seedDiscounts); const [taxes]=useStoredState<Tax[]>("syntax-taxes-v1",seedTaxes);
 const products=readStore<ProductOption[]>("syntax-products-v1",seedProducts);
 const activeProducts=products.filter(p=>p.active!==false&&p.status!=="Archived").length;
 return <><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-wider text-violet-700">Catalogue workspace</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Product Catalogue & Pricing</h1><p className="mt-2 text-sm text-slate-500">Manage products, subscription plans, discounts, and tax rules in one place.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><CheckCircle2 size={14}/> Workspace ready</span></div>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:"Products",value:products.length,sub:`${activeProducts} active`,icon:Package},{label:"Subscription plans",value:plans.length,sub:`${plans.filter(p=>p.active).length} active`,icon:ShoppingBag},{label:"Active discounts",value:discounts.filter(d=>d.active).length,sub:"Pricing promotions",icon:Percent},{label:"Active tax rules",value:taxes.filter(t=>t.active).length,sub:"Configured rates",icon:Receipt}].map(c=>{const Icon=c.icon;return <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{c.label}</span><span className="rounded-lg bg-violet-50 p-2 text-violet-700"><Icon size={18}/></span></div><p className="mt-4 text-3xl font-bold text-slate-900">{c.value}</p><p className="mt-1 text-xs text-slate-400">{c.sub}</p></div>})}</div>
 <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"><section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Manage your catalogue</h2><p className="mt-1 text-sm text-slate-500">Jump directly to a module to create or update your pricing data.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{navItems.filter(n=>n.to!=="/").map(item=>{const Icon=item.icon;return <button key={item.to} onClick={()=>location.href=item.to} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/50"><span className="rounded-lg bg-violet-100 p-2 text-violet-700"><Icon size={19}/></span><span><span className="block text-sm font-semibold">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.to==="/products"?"Manage product types, prices and active status":item.to==="/plans"?"Set billing frequency and plan prices":item.to==="/discounts"?"Configure fixed and percentage offers":"Maintain tax rates and activation"}</span></span><ArrowUpRight size={16} className="ml-auto text-slate-400"/></button>})}</div></section>
 <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2"><CircleDollarSign size={19} className="text-violet-700"/><h2 className="font-semibold text-slate-900">Pricing calculation</h2></div><p className="mt-2 text-sm leading-6 text-slate-500">Use the same calculation order when integrating this catalogue with quotations and invoices.</p><ol className="mt-5 space-y-3 text-sm">{["Subtotal = unit price × quantity","Apply eligible discount (capped at subtotal)","Taxable amount = subtotal − discount","Tax = taxable amount × tax rate","Total = taxable amount + tax"].map((t,i)=><li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">{i+1}</span><span className="pt-0.5 text-slate-700">{t}</span></li>)}</ol><div className="mt-5 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800"><AlertCircle size={16} className="shrink-0"/><span>This branch currently contains frontend source only. Backend persistence and server-side permission checks still need API integration.</span></div></section></div>
 </>;
}
function PageHeader({eyebrow,title,description,onAdd,addLabel}:{eyebrow:string;title:string;description:string;onAdd:()=>void;addLabel:string}){return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-wider text-violet-700">{eyebrow}</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div><button onClick={onAdd} className="inline-flex w-fit items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Plus size={17}/>{addLabel}</button></div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>}
const inputClass="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close dialog"><X size={18}/></button></div><div className="p-6">{children}</div></div></div>}
function StatusPill({active}:{active:boolean}){return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{active?"Active":"Inactive"}</span>}
function ActionButtons({onEdit,onToggle,active,onDelete}:{onEdit:()=>void;onToggle:()=>void;active:boolean;onDelete?:()=>void}){return <div className="flex justify-end gap-1"><button title="Edit" aria-label="Edit" onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700"><Pencil size={16}/></button><button title={active?"Deactivate":"Reactivate"} aria-label={active?"Deactivate":"Reactivate"} onClick={onToggle} className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700"><Power size={16}/></button>{onDelete&&<button title="Delete" aria-label="Delete" onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16}/></button>}</div>}
function PlansPage(){
 const [plans,setPlans]=useStoredState<Plan[]>("syntax-plans-v1",seedPlans); const [products]=useStoredState<ProductOption[]>("syntax-products-v1",seedProducts); const [search,setSearch]=useState(""); const [frequency,setFrequency]=useState("All"); const [activeFilter,setActiveFilter]=useState("All"); const [editing,setEditing]=useState<Plan|null>(null); const [planModalOpen,setPlanModalOpen]=useState(false); const [error,setError]=useState("");
 const activeProducts=products.filter(p=>p.active!==false&&p.status!=="Archived");
 const [form,setForm]=useState<Omit<Plan,"id">>({name:"",productId:0,frequency:"Monthly",price:0,minQuantity:1,from:"",to:"",active:true,description:""});
 const filtered=useMemo(()=>plans.filter(p=>(p.name.toLowerCase().includes(search.toLowerCase()))&&(frequency==="All"||p.frequency===frequency)&&(activeFilter==="All"||(activeFilter==="Active"?p.active:!p.active))),[plans,search,frequency,activeFilter]);
 function open(p?:Plan){setEditing(p??null);setPlanModalOpen(true);setForm(p?{name:p.name,productId:p.productId,frequency:p.frequency,price:p.price,minQuantity:p.minQuantity,from:p.from,to:p.to,active:p.active,description:p.description}:{name:"",productId:activeProducts[0]?.id??0,frequency:"Monthly",price:0,minQuantity:1,from:"",to:"",active:true,description:""});setError("");}
 function save(e:React.FormEvent){e.preventDefault();if(!form.name.trim()){setError("Plan name is required.");return}if(!activeProducts.some(p=>p.id===Number(form.productId))){setError("Select an active product. Create a product first if the list is empty.");return}if(!Number.isFinite(Number(form.price))||Number(form.price)<0||!Number.isInteger(Number(form.minQuantity))||Number(form.minQuantity)<1){setError("Price must be non-negative and minimum quantity must be at least 1.");return}if(form.from&&form.to&&form.from>form.to){setError("Availability end date must be on or after the start date.");return}const row={...form,productId:Number(form.productId),price:Number(form.price),minQuantity:Number(form.minQuantity),name:form.name.trim()};setPlans(prev=>editing?prev.map(p=>p.id===editing.id?{...p,...row}:p):[...prev,{...row,id:Math.max(0,...prev.map(p=>p.id))+1}]);setEditing(null);setPlanModalOpen(false)}
 const productName=(id:number)=>products.find(p=>p.id===id)?.name??`Product #${id}`;
 return <><PageHeader eyebrow="Catalogue / Billing" title="Subscription Plans" description="Configure recurring plans, billing periods, prices, and availability." onAdd={()=>open()} addLabel="Create plan"/><div className="mb-5 grid gap-3 sm:grid-cols-3"><Stat label="Total plans" value={plans.length}/><Stat label="Active plans" value={plans.filter(p=>p.active).length}/><Stat label="Billing frequencies" value={new Set(plans.map(p=>p.frequency)).size}/></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><Toolbar search={search} onSearch={setSearch} placeholder="Search plans..." filters={<><select className={inputClass+" sm:w-auto"} value={frequency} onChange={e=>setFrequency(e.target.value)}><option>All</option>{["Daily","Weekly","Monthly","Yearly"].map(x=><option key={x}>{x}</option>)}</select><select className={inputClass+" sm:w-auto"} value={activeFilter} onChange={e=>setActiveFilter(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></>}/><Table headers={["Plan","Product","Billing","Price","Min. qty","Availability","Status","Actions"]} empty={!filtered.length} emptyText="No plans match these filters."><>{filtered.map(p=><tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{p.name}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{p.description||"No description"}</p></td><td className="px-5 py-4 text-sm">{productName(p.productId)}</td><td className="px-5 py-4 text-sm">{p.frequency}</td><td className="px-5 py-4 text-sm font-semibold">{money(p.price)}</td><td className="px-5 py-4 text-sm">{p.minQuantity}</td><td className="px-5 py-4 text-xs text-slate-500">{p.from||"Any"} – {p.to||"No end"}</td><td className="px-5 py-4"><StatusPill active={p.active}/></td><td className="px-5 py-4"><ActionButtons onEdit={()=>open(p)} active={p.active} onToggle={()=>setPlans(old=>old.map(x=>x.id===p.id?{...x,active:!x.active}:x))}/></td></tr>)}</></Table></div>
 {editing!==null||(!editing&&form.name!=="" )?null:null}
 {/** Modal is driven by an explicit form-open sentinel below. */}
 <PlanModal key={editing?.id??"new"} openState={editing} form={form} setForm={setForm} error={error} onClose={()=>{setPlanModalOpen(false);setEditing(null);setError("");setForm({name:"",productId:0,frequency:"Monthly",price:0,minQuantity:1,from:"",to:"",active:true,description:""});}} onSave={save} products={activeProducts} isOpen={planModalOpen}/>
 </>;
}
function PlanModal({openState,form,setForm,error,onClose,onSave,products,isOpen}:{openState:Plan|null;form:Omit<Plan,"id">;setForm:React.Dispatch<React.SetStateAction<Omit<Plan,"id">>>;error:string;onClose:()=>void;onSave:(e:React.FormEvent)=>void;products:ProductOption[];isOpen:boolean}){
 // The create action is represented by the form name sentinel.
 const visible=isOpen||openState!==null;
 if(!visible)return null;
 return <Modal title={openState?"Edit subscription plan":"Create subscription plan"} onClose={onClose}><form onSubmit={onSave} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Plan name *"><input required className={inputClass} value={form.name==="__new__"?"":form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Premium Monthly"/></Field><Field label="Product *"><select className={inputClass} required value={form.productId} onChange={e=>setForm({...form,productId:Number(e.target.value)})}><option value={0}>Select product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Billing frequency *"><select className={inputClass} value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value as Plan["frequency"]})}>{["Daily","Weekly","Monthly","Yearly"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Price (₹) *"><input type="number" min="0" step="0.01" required className={inputClass} value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})}/></Field><Field label="Minimum quantity *"><input type="number" min="1" step="1" required className={inputClass} value={form.minQuantity} onChange={e=>setForm({...form,minQuantity:Number(e.target.value)})}/></Field><Field label="Available from"><input type="date" className={inputClass} value={form.from} onChange={e=>setForm({...form,from:e.target.value})}/></Field><Field label="Available until"><input type="date" className={inputClass} value={form.to} onChange={e=>setForm({...form,to:e.target.value})}/></Field><Field label="Status"><select className={inputClass} value={form.active?"Active":"Inactive"} onChange={e=>setForm({...form,active:e.target.value==="Active"})}><option>Active</option><option>Inactive</option></select></Field></div><Field label="Description"><textarea className={inputClass} rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field>{error&&<p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Save plan</button></div></form></Modal>;
}
function DiscountsPage(){
 const [discounts,setDiscounts]=useStoredState<Discount[]>("syntax-discounts-v1",seedDiscounts);const [products]=useStoredState<ProductOption[]>("syntax-products-v1",seedProducts);const [plans]=useStoredState<Plan[]>("syntax-plans-v1",seedPlans);const [search,setSearch]=useState("");const [editing,setEditing]=useState<Discount|null>(null);const [open,setOpen]=useState(false);const [error,setError]=useState("");const [form,setForm]=useState<Omit<Discount,"id">>({name:"",type:"Percentage",value:10,appliesTo:"All",targetId:null,from:"",to:"",active:true});
 const filtered=discounts.filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));function start(d?:Discount){setEditing(d??null);setForm(d?{name:d.name,type:d.type,value:d.value,appliesTo:d.appliesTo,targetId:d.targetId,from:d.from,to:d.to,active:d.active}:{name:"",type:"Percentage",value:10,appliesTo:"All",targetId:null,from:"",to:"",active:true});setError("");setOpen(true)}
 function save(e:React.FormEvent){e.preventDefault();if(!form.name.trim()){setError("Discount name is required.");return}if(!Number.isFinite(Number(form.value))||Number(form.value)<=0||(form.type==="Percentage"&&Number(form.value)>100)){setError(form.type==="Percentage"?"Percentage must be greater than 0 and no more than 100.":"Fixed discount must be greater than 0.");return}if(form.appliesTo!=="All"&&!form.targetId){setError("Choose a product or plan for this discount.");return}if(form.appliesTo==="Product"&&!products.some(p=>p.id===form.targetId)){setError("Selected product was not found.");return}if(form.appliesTo==="Plan"&&!plans.some(p=>p.id===form.targetId)){setError("Selected plan was not found.");return}if(form.from&&form.to&&form.from>form.to){setError("End date must be on or after start date.");return}const row={...form,name:form.name.trim(),value:Number(form.value)};setDiscounts(old=>editing?old.map(d=>d.id===editing.id?{...d,...row}:d):[...old,{...row,id:Math.max(0,...old.map(d=>d.id))+1}]);setOpen(false)}
 const targetName=(d:Discount)=>d.appliesTo==="All"?"All products and plans":d.appliesTo==="Product"?(products.find(p=>p.id===d.targetId)?.name??"Missing product"):(plans.find(p=>p.id===d.targetId)?.name??"Missing plan");
 return <><PageHeader eyebrow="Catalogue / Promotions" title="Discounts" description="Define promotional rules by percentage or fixed amount and choose where they apply." onAdd={()=>start()} addLabel="Add discount"/><div className="mb-5 grid gap-3 sm:grid-cols-3"><Stat label="Total discounts" value={discounts.length}/><Stat label="Active discounts" value={discounts.filter(d=>d.active).length}/><Stat label="Percentage discounts" value={discounts.filter(d=>d.type==="Percentage").length}/></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><Toolbar search={search} onSearch={setSearch} placeholder="Search discounts..."/><Table headers={["Discount","Type","Value","Applies to","Validity","Status","Actions"]} empty={!filtered.length} emptyText="No discounts found."><>{filtered.map(d=><tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4 font-semibold">{d.name}</td><td className="px-5 py-4 text-sm">{d.type}</td><td className="px-5 py-4 text-sm font-semibold">{d.type==="Percentage"?`${d.value}%`:money(d.value)}</td><td className="px-5 py-4 text-sm">{targetName(d)}</td><td className="px-5 py-4 text-xs text-slate-500">{d.from||"Any date"} – {d.to||"No end"}</td><td className="px-5 py-4"><StatusPill active={d.active}/></td><td className="px-5 py-4"><ActionButtons onEdit={()=>start(d)} active={d.active} onToggle={()=>setDiscounts(old=>old.map(x=>x.id===d.id?{...x,active:!x.active}:x))}/></td></tr>)}</>)</Table></div>
 {open&&<Modal title={editing?"Edit discount":"Create discount"} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Discount name *"><input required className={inputClass} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Discount type *"><select className={inputClass} value={form.type} onChange={e=>setForm({...form,type:e.target.value as Discount["type"],value:e.target.value==="Percentage"?10:100})}><option>Percentage</option><option>Fixed</option></select></Field><Field label={form.type==="Percentage"?"Percentage (%) *":"Fixed amount (₹) *"}><input required type="number" min="0.01" max={form.type==="Percentage"?100:undefined} step="0.01" className={inputClass} value={form.value} onChange={e=>setForm({...form,value:Number(e.target.value)})}/></Field><Field label="Applies to *"><select className={inputClass} value={form.appliesTo} onChange={e=>setForm({...form,appliesTo:e.target.value as Discount["appliesTo"],targetId:null})}><option>All</option><option>Product</option><option>Plan</option></select></Field>{form.appliesTo!=="All"&&<Field label={`Select ${form.appliesTo.toLowerCase()} *`}><select required className={inputClass} value={form.targetId??""} onChange={e=>setForm({...form,targetId:Number(e.target.value)||null})}><option value="">Select {form.appliesTo.toLowerCase()}</option>{(form.appliesTo==="Product"?products:plans).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>}<Field label="Valid from"><input type="date" className={inputClass} value={form.from} onChange={e=>setForm({...form,from:e.target.value})}/></Field><Field label="Valid until"><input type="date" className={inputClass} value={form.to} onChange={e=>setForm({...form,to:e.target.value})}/></Field><Field label="Status"><select className={inputClass} value={form.active?"Active":"Inactive"} onChange={e=>setForm({...form,active:e.target.value==="Active"})}><option>Active</option><option>Inactive</option></select></Field></div>{error&&<p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div className="rounded-lg bg-violet-50 p-3 text-xs leading-5 text-violet-800">Discounts should be capped at the eligible subtotal. This screen stores rules; applying discounts to quotations requires backend pricing integration.</div><div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Save discount</button></div></form></Modal>}</>;
}
function TaxesPage(){
 const [taxes,setTaxes]=useStoredState<Tax[]>("syntax-taxes-v1",seedTaxes);const [search,setSearch]=useState("");const [editing,setEditing]=useState<Tax|null>(null);const [open,setOpen]=useState(false);const [error,setError]=useState("");const [form,setForm]=useState({name:"",rate:18,active:true});
 function start(t?:Tax){setEditing(t??null);setForm(t?{name:t.name,rate:t.rate,active:t.active}:{name:"",rate:18,active:true});setError("");setOpen(true)}
 function save(e:React.FormEvent){e.preventDefault();if(!form.name.trim()){setError("Tax name is required.");return}if(!Number.isFinite(Number(form.rate))||Number(form.rate)<0||Number(form.rate)>100){setError("Tax rate must be between 0 and 100.");return}const row={name:form.name.trim(),rate:Number(form.rate),active:form.active};setTaxes(old=>editing?old.map(t=>t.id===editing.id?{...t,...row}:t):[...old,{...row,id:Math.max(0,...old.map(t=>t.id))+1}]);setOpen(false)}
 const filtered=taxes.filter(t=>t.name.toLowerCase().includes(search.toLowerCase()));
 return <><PageHeader eyebrow="Catalogue / Tax configuration" title="Tax Settings" description="Manage tax rates used in pricing calculations and downstream billing." onAdd={()=>start()} addLabel="Add tax rate"/><div className="mb-5 grid gap-3 sm:grid-cols-3"><Stat label="Tax rules" value={taxes.length}/><Stat label="Active tax rules" value={taxes.filter(t=>t.active).length}/><Stat label="Highest configured rate" value={`${Math.max(0,...taxes.map(t=>t.rate))}%`}/></div><div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]"><div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><Toolbar search={search} onSearch={setSearch} placeholder="Search tax rates..."/><Table headers={["Tax name","Rate","Status","Actions"]} empty={!filtered.length} emptyText="No tax rules found."><>{filtered.map(t=><tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4 font-semibold">{t.name}</td><td className="px-5 py-4 text-sm font-semibold">{t.rate}%</td><td className="px-5 py-4"><StatusPill active={t.active}/></td><td className="px-5 py-4"><ActionButtons onEdit={()=>start(t)} active={t.active} onToggle={()=>setTaxes(old=>old.map(x=>x.id===t.id?{...x,active:!x.active}:x))}/></td></tr>)}</>)</Table></div><TaxCalculator taxes={taxes}/></div>
 {open&&<Modal title={editing?"Edit tax rate":"Create tax rate"} onClose={()=>setOpen(false)}><form onSubmit={save} className="space-y-4"><Field label="Tax name *"><input required className={inputClass} placeholder="e.g. GST" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label="Tax percentage (0–100) *"><input type="number" min="0" max="100" step="0.01" required className={inputClass} value={form.rate} onChange={e=>setForm({...form,rate:Number(e.target.value)})}/></Field><Field label="Status"><select className={inputClass} value={form.active?"Active":"Inactive"} onChange={e=>setForm({...form,active:e.target.value==="Active"})}><option>Active</option><option>Inactive</option></select></Field>{error&&<p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Save tax rate</button></div></form></Modal>}</>;
}
function TaxCalculator({taxes}:{taxes:Tax[]}){const [subtotal,setSubtotal]=useState("1000");const [discount,setDiscount]=useState("100");const [taxId,setTaxId]=useState(String(taxes.find(t=>t.active)?.id??""));const selected=taxes.find(t=>String(t.id)===taxId&&t.active);const amount=Math.max(0,Number(subtotal)||0);const discountAmount=Math.min(amount,Math.max(0,Number(discount)||0));const taxable=amount-discountAmount;const tax=taxable*(selected?.rate??0)/100;return <section className="h-fit rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2"><CircleDollarSign size={19} className="text-violet-700"/><h2 className="font-semibold">Tax calculator preview</h2></div><p className="mt-1 text-sm text-slate-500">Preview calculation order with a selected active tax rule.</p><div className="mt-5 space-y-4"><Field label="Subtotal (₹)"><input className={inputClass} type="number" min="0" value={subtotal} onChange={e=>setSubtotal(e.target.value)}/></Field><Field label="Discount (₹)"><input className={inputClass} type="number" min="0" value={discount} onChange={e=>setDiscount(e.target.value)}/></Field><Field label="Tax rule"><select className={inputClass} value={taxId} onChange={e=>setTaxId(e.target.value)}><option value="">No tax</option>{taxes.filter(t=>t.active).map(t=><option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}</select></Field></div><div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm"><Line label="Subtotal" value={money(amount)}/><Line label="Discount applied" value={`− ${money(discountAmount)}`}/><Line label="Taxable amount" value={money(taxable)}/><Line label={`Tax${selected?` (${selected.rate}%)`:""}`} value={money(tax)}/><div className="flex items-center justify-between rounded-lg bg-violet-50 p-3 text-base font-bold text-violet-900"><span>Total</span><span>{money(taxable+tax)}</span></div></div><p className="mt-3 text-xs leading-5 text-slate-400">Preview only; the backend must be the authoritative source for final invoice totals and rounding.</p></section>}
function Line({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between text-slate-600"><span>{label}</span><span className="font-medium text-slate-800">{value}</span></div>}
function Stat({label,value}:{label:string;value:string|number}){return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>}
function Toolbar({search,onSearch,placeholder,filters}:{search:string;onSearch:(s:string)=>void;placeholder:string;filters?:React.ReactNode}){return <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"><Search size={17} className="text-slate-400"/><input value={search} onChange={e=>onSearch(e.target.value)} placeholder={placeholder} className="min-w-0 bg-transparent text-sm outline-none sm:w-56"/></label><div className="flex flex-col gap-2 sm:flex-row">{filters}</div></div>}
function Table({headers,children,empty,emptyText}:{headers:string[];children:React.ReactNode;empty:boolean;emptyText:string}){return <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="bg-slate-50"><tr className="text-xs uppercase tracking-wide text-slate-500">{headers.map(h=><th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{empty?<tr><td colSpan={headers.length} className="px-5 py-12 text-center"><Package className="mx-auto mb-3 text-slate-300" size={28}/><p className="text-sm font-medium text-slate-700">{emptyText}</p><p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p></td></tr>:children}</tbody></table></div>}
export default function App(){return <BrowserRouter><Shell/></BrowserRouter>}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layout & Route Guards
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Member 1: Auth & User Management
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { StaffManagementPage } from './pages/auth/StaffManagementPage';
import { CustomerListPage } from './pages/auth/CustomerListPage';
import { CustomerProfilePage } from './pages/auth/CustomerProfilePage';
import { AccountSettingsPage } from './pages/auth/AccountSettingsPage';

// Member 2: Catalogue & Pricing
import { ProductListPage } from './pages/catalogue/ProductListPage';
import { AddEditProductPage } from './pages/catalogue/AddEditProductPage';
import { PlanListPage } from './pages/catalogue/PlanListPage';
import { AddEditPlanPage } from './pages/catalogue/AddEditPlanPage';
import { DiscountManagementPage } from './pages/catalogue/DiscountManagementPage';
import { TaxSettingsPage } from './pages/catalogue/TaxSettingsPage';

// Member 3: Quotations & Subscriptions
import { QuotationListPage } from './pages/subscriptions/QuotationListPage';
import { CreateQuotationPage } from './pages/subscriptions/CreateQuotationPage';
import { QuotationDetailPage } from './pages/subscriptions/QuotationDetailPage';
import { SubscriptionListPage } from './pages/subscriptions/SubscriptionListPage';
import { SubscriptionDetailPage } from './pages/subscriptions/SubscriptionDetailPage';
import { CustomerMySubscriptionsPage } from './pages/subscriptions/CustomerMySubscriptionsPage';

// Member 4: Finance & Invoicing
import { FinanceDashboardPage } from './pages/finance/FinanceDashboardPage';
import { InvoiceListPage } from './pages/finance/InvoiceListPage';
import { InvoiceDetailPage } from './pages/finance/InvoiceDetailPage';
import { PaymentListPage } from './pages/finance/PaymentListPage';
import { OverdueInvoicesPage } from './pages/finance/OverdueInvoicesPage';
import { RevenueReportPage } from './pages/finance/RevenueReportPage';
import { CustomerMyInvoicesPage } from './pages/finance/CustomerMyInvoicesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Application Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<FinanceDashboardPage />} />

              {/* Member 1: Staff & Customer Management */}
              <Route path="/staff" element={<StaffManagementPage />} />
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/:id" element={<CustomerProfilePage />} />
              <Route path="/settings" element={<AccountSettingsPage />} />

              {/* Member 2: Products & Catalogue */}
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/new" element={<AddEditProductPage />} />
              <Route path="/products/:id" element={<AddEditProductPage />} />
              <Route path="/plans" element={<PlanListPage />} />
              <Route path="/plans/new" element={<AddEditPlanPage />} />
              <Route path="/plans/:id" element={<AddEditPlanPage />} />
              <Route path="/discounts" element={<DiscountManagementPage />} />
              <Route path="/taxes" element={<TaxSettingsPage />} />

              {/* Member 3: Quotations & Subscriptions */}
              <Route path="/quotations" element={<QuotationListPage />} />
              <Route path="/quotations/new" element={<CreateQuotationPage />} />
              <Route path="/quotations/:id" element={<QuotationDetailPage />} />
              <Route path="/subscriptions" element={<SubscriptionListPage />} />
              <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
              <Route path="/my-subscriptions" element={<CustomerMySubscriptionsPage />} />

              {/* Member 4: Finance, Invoices & Reports */}
              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/invoices/overdue" element={<OverdueInvoicesPage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="/payments" element={<PaymentListPage />} />
              <Route path="/reports/revenue" element={<RevenueReportPage />} />
              <Route path="/my-invoices" element={<CustomerMyInvoicesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from 'react'
import {
  getFinanceDashboard,
  getInvoices,
  getPayments,
  createPayment,
  type FinanceDashboard,
  type Invoice,
  type Payment,
} from './services/api'

type Page = 'Overview' | 'Invoices' | 'Payments' | 'Customers'

const navigation: { name: Page; icon: string; hint: string }[] = [
  { name: 'Overview', icon: '◫', hint: '⌘ 1' },
  { name: 'Invoices', icon: '▤', hint: '⌘ 2' },
  { name: 'Payments', icon: '↗', hint: '⌘ 3' },
  { name: 'Customers', icon: '♙', hint: '⌘ 4' },
]

const money = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const compactMoney = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)

const prettyDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const initials = (value: string) =>
  value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'BL'

const normalizedStatus = (status: string, dueDate?: string) => {
  const value = status.toLowerCase()
  if (value.includes('cancel')) return 'Cancelled'
  if (value.includes('paid') || value.includes('settled')) return 'Paid'
  if (value.includes('overdue') || (dueDate && dueDate < new Date().toISOString().slice(0, 10))) return 'Overdue'
  if (value.includes('draft')) return 'Draft'
  return 'Pending'
}

function App() {
  const [activePage, setActivePage] = useState<Page>('Overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [clock, setClock] = useState(new Date())
  const searchRef = useRef<HTMLInputElement>(null)

  const refreshData = () => {
    setDashboardLoading(true)
    setInvoicesLoading(true)
    getFinanceDashboard()
      .then((data) => { setDashboard(data); setDashboardError(null) })
      .catch((error: unknown) => setDashboardError(error instanceof Error ? error.message : 'Unable to load dashboard data'))
      .finally(() => setDashboardLoading(false))
    getInvoices()
      .then((data) => { setInvoices(data); setInvoicesError(null) })
      .catch((error: unknown) => setInvoicesError(error instanceof Error ? error.message : 'Unable to load invoices'))
      .finally(() => setInvoicesLoading(false))
  }

  useEffect(() => { refreshData() }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (!typing && (event.metaKey || event.ctrlKey) && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault()
        setActivePage(navigation[Number(event.key) - 1].name)
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const status = normalizedStatus(invoice.status, invoice.due_date)
    const query = `${invoice.invoice_number} ${invoice.customer_id} ${invoice.status} ${invoice.total_amount}`.toLowerCase()
    return query.includes(search.toLowerCase()) && (statusFilter === 'All statuses' || status === statusFilter)
  }), [invoices, search, statusFilter])

  const totalRevenue = Number(dashboard?.total_revenue ?? 0)
  const outstanding = Number(dashboard?.total_outstanding ?? 0)
  const billed = totalRevenue + outstanding
  const collectionRate = billed > 0 ? Math.min(100, (totalRevenue / billed) * 100) : 0
  const largestInvoices = [...invoices]
    .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
    .slice(0, 5)
  const maxInvoice = Math.max(...largestInvoices.map((invoice) => Number(invoice.total_amount) || 0), 1)

  const navigate = (page: Page) => {
    setActivePage(page)
    setCommandOpen(false)
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  return (
    <div className="brightloop-app">
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => navigate('Overview')} aria-label="Brightloop home">
          <span className="brand-mark">b<span>.</span></span>
          <span className="brand-copy"><strong>brightloop</strong><small>FINANCE OS</small></span>
          <span className="brand-spark">✳</span>
        </button>

        <div className="workspace-label">WORKSPACE <span>01 / FINANCE</span></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <button
              key={item.name}
              onClick={() => navigate(item.name)}
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === 'Invoices' && <span className="nav-count">{invoices.length}</span>}
              <span className="nav-hint">{item.hint}</span>
              {activePage === item.name && <span className="nav-active-line" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-health">
          <div className="health-top"><span className="pulse-dot" /> SYSTEM STATUS <span className="health-live">LIVE</span></div>
          <p>All systems in sync.</p>
          <small>Finance data connected to your local API.</small>
          <div className="health-scan"><span /></div>
        </div>
        <div className="sidebar-bottom"><span>BRIGHTLOOP SOFTWARE</span><span>v1.0.0</span></div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><i>/</i><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <span className="live-status"><span className="pulse-dot" /> API CONNECTED</span>
            <button className="command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open command menu">
              <span>⌕</span><span className="command-label">Quick jump</span><kbd>⌘ K</kbd>
            </button>
            <div className="top-divider" />
            <button className="profile-button" onClick={() => setCommandOpen(true)} aria-label="Open quick actions">
              <span className="avatar">AM</span><span className="profile-copy"><strong>Admin Member</strong><small>Finance team</small></span><span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {activePage === 'Overview' && (
            <>
              <section className="hero-panel" onMouseMove={handlePointerMove} style={{ '--spot-x': `${cursor.x}px`, '--spot-y': `${cursor.y}px` } as CSSProperties}>
                <div className="hero-grid" />
                <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-line" /> FINANCIAL COMMAND CENTER <span className="eyebrow-year">/ 2026</span></div>
                  <h1>Clarity looks<br />good on <em>you.</em></h1>
                  <p>Your business, in focus. Every invoice, every rupee,<br className="desktop-break" /> one beautifully clear picture.</p>
                  <div className="hero-actions">
                    <button className="button-gold" onClick={() => navigate('Invoices')}>Explore invoices <span>↗</span></button>
                    <button className="button-quiet" onClick={refreshData}><span className={dashboardLoading || invoicesLoading ? 'refresh-spin' : ''}>↻</span> Refresh data</button>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-halo" />
                  <div className="art-ring ring-back" />
                  <div className="art-ring ring-front" />
                  <div className="art-core"><span>₹</span><small>IN FOCUS</small></div>
                  <div className="floating-chip chip-top"><span className="chip-dot" /> REAL-TIME OVERVIEW</div>
                  <div className="floating-chip chip-bottom"><span>↗</span><div><strong>{dashboardLoading ? 'Syncing…' : money(totalRevenue)}</strong><small>Collected to date</small></div></div>
                  <div className="art-cross cross-one">✳</div><div className="art-cross cross-two">+</div>
                </div>
                <div className="hero-foot"><span><span className="pulse-dot" /> LIVE WORKSPACE</span><span>{new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(clock)}</span></div>
              </section>

              <section className="metrics-section">
                <div className="section-heading"><div><span className="section-kicker">THE BIG PICTURE</span><h2>Your numbers, <em>without the noise.</em></h2></div><span className="section-meta">01 — OVERVIEW</span></div>
                {dashboardError && <div className="inline-alert"><span>!</span><div><strong>Couldn't load finance data</strong><small>{dashboardError}</small></div><button onClick={refreshData}>Try again ↗</button></div>}
                <div className="metrics-grid">
                  <MetricCard index="01" title="Total revenue" amount={dashboard ? money(dashboard.total_revenue) : '—'} note="Payments received" icon="↗" featured loading={dashboardLoading} />
                  <MetricCard index="02" title="Outstanding" amount={dashboard ? money(dashboard.total_outstanding) : '—'} note="Awaiting collection" icon="◷" loading={dashboardLoading} />
                  <MetricCard index="03" title="Paid invoices" amount={dashboard ? String(dashboard.paid_invoices) : '—'} note="Successfully settled" icon="✓" loading={dashboardLoading} />
                  <MetricCard index="04" title="Overdue amount" amount={dashboard ? money(dashboard.overdue_amount) : '—'} note={`${dashboard?.overdue_invoice_count ?? '—'} invoices need attention`} icon="!" warning loading={dashboardLoading} />
                </div>
              </section>

              <section className="insights-grid">
                <div className="panel invoice-analytics">
                  <div className="panel-heading"><div><span className="section-kicker">PORTFOLIO BREAKDOWN</span><h3>Biggest invoices <span className="heading-dot">.</span></h3><p>Where the value is concentrated.</p></div><span className="panel-index">02 / 04</span></div>
                  {invoicesLoading ? <div className="skeleton-stack">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div> : invoicesError ? <EmptyState title="Invoice data unavailable" detail={invoicesError} action="Retry" onAction={refreshData} /> : largestInvoices.length === 0 ? <EmptyState title="Nothing billed just yet" detail="Your invoices will appear here once you create the first one." action="View invoices" onAction={() => navigate('Invoices')} /> : (
                    <div className="invoice-bars">
                      {largestInvoices.map((invoice, index) => (
                        <button className="invoice-bar-row" key={invoice.id} onClick={() => navigate('Invoices')} title={`Open invoices · ${invoice.invoice_number}`}>
                          <span className="bar-rank">0{index + 1}</span>
                          <span className="bar-main"><span className="bar-label">{invoice.invoice_number}</span><span className="bar-track"><span className="bar-fill" style={{ '--bar-width': `${Math.max(4, (Number(invoice.total_amount) / maxInvoice) * 100)}%`, '--bar-delay': `${index * 90}ms` } as CSSProperties} /></span></span>
                          <span className="bar-value">{compactMoney(invoice.total_amount)}</span><span className="bar-arrow">↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="panel-footer"><span><span className="legend-dot" /> Invoice value</span><button onClick={() => navigate('Invoices')}>All invoices <span>↗</span></button></div>
                </div>

                <div className="collection-panel" onMouseMove={handlePointerMove} style={{ '--spot-x': `${cursor.x}px`, '--spot-y': `${cursor.y}px` } as CSSProperties}>
                  <div className="collection-top"><span className="section-kicker">COLLECTION HEALTH</span><span className="collection-symbol">◉</span></div>
                  <div className="collection-rate">{dashboardLoading ? '—' : <>{collectionRate.toFixed(1)}<span>%</span></>}</div>
                  <p className="collection-caption">of billed revenue collected</p>
                  <div className="collection-progress"><span style={{ width: `${dashboardLoading ? 0 : collectionRate}%` }} /></div>
                  <div className="collection-stats">
                    <div><span>Collected</span><strong>{dashboard ? money(totalRevenue) : '—'}</strong></div>
                    <div><span>Still outstanding</span><strong>{dashboard ? money(outstanding) : '—'}</strong></div>
                    <div className="collection-total"><span>Total billed</span><strong>{dashboard ? money(billed) : '—'}</strong></div>
                  </div>
                  <div className="collection-watermark">b.</div>
                  <div className="collection-foot"><span className="pulse-dot" /> Calculated from live finance data</div>
                </div>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading recent-heading"><div><span className="section-kicker">LATEST ACTIVITY</span><h3>Recent invoices<span className="heading-dot">.</span></h3><p>A live window into your billing activity.</p></div><button className="button-outline" onClick={() => navigate('Invoices')}>View all invoices <span>↗</span></button></div>
                <InvoiceTable invoices={filteredInvoices.slice(0, 5)} loading={invoicesLoading} error={invoicesError} formatMoney={money} onRetry={refreshData} />
              </section>

              <Footer />
            </>
          )}

          {activePage === 'Invoices' && (
            <>
              <section className="page-intro">
                <div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> BILLING WORKSPACE / 01</div><h1>Every detail.<br /><em>Accounted for.</em></h1><p>One place for every invoice, status, and outstanding rupee.</p></div>
                <div className="page-intro-stat"><span>INVOICE REGISTER</span><strong>{invoicesLoading ? '—' : String(invoices.length).padStart(2, '0')}</strong><small>Total records retrieved</small></div>
              </section>
              <section className="invoice-page-panel panel">
                <div className="invoice-toolbar"><div><span className="section-kicker">THE REGISTER</span><h3>All invoices<span className="heading-dot">.</span></h3></div><div className="invoice-controls"><label className="search-box"><span>⌕</span><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice, customer ID…" /><kbd>/</kbd></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by invoice status"><option>All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option><option>Cancelled</option><option>Draft</option></select></div></div>
                <div className="register-summary"><span><strong>{filteredInvoices.length}</strong> results</span><span>Synced from FastAPI <span className="pulse-dot" /></span></div>
                <InvoiceTable invoices={filteredInvoices} loading={invoicesLoading} error={invoicesError} formatMoney={money} onRetry={refreshData} />
                <div className="register-footer"><span>Showing {filteredInvoices.length} of {invoices.length} invoices</span><button onClick={refreshData}><span className={invoicesLoading ? 'refresh-spin' : ''}>↻</span> Refresh register</button></div>
              </section>
              <Footer />
            </>
          )}

          {activePage === 'Payments' && (
            <PaymentsWorkspace invoices={invoices} invoicesLoading={invoicesLoading} onPaymentSaved={refreshData} />
          )}
          {activePage === 'Customers' && (
            <ModulePlaceholder icon="♙" number="03" eyebrow="CUSTOMER DIRECTORY" title={<>Relationships,<br /><em>beautifully organized.</em></>} description="The customer directory can be connected as soon as the customer-list endpoint is available in your backend." />
          )}
        </div>
      </main>

      {commandOpen && (
        <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false) }}>
          <div className="command-modal" role="dialog" aria-modal="true" aria-label="Quick navigation">
            <div className="command-modal-top"><span>✳</span><input autoFocus placeholder="Where would you like to go?" onChange={(event) => setCommandQuery(event.target.value)} value={commandQuery} /><kbd>ESC</kbd></div>
            <div className="command-group-label">NAVIGATION</div>
            {navigation.filter((item) => item.name.toLowerCase().includes(commandQuery.toLowerCase())).map((item) => (
              <button className="command-option" key={item.name} onClick={() => { navigate(item.name); setCommandQuery('') }}><span className="command-option-icon">{item.icon}</span><span>{item.name}</span><kbd>{item.hint}</kbd><span className="command-option-arrow">↗</span></button>
            ))}
            <div className="command-modal-footer"><span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span></div>
          </div>
        </div>
      )}
    </div>
  )
}


function PaymentsWorkspace({ invoices, invoicesLoading, onPaymentSaved }: {
  invoices: Invoice[]; invoicesLoading: boolean; onPaymentSaved: () => void
}) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('All methods')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('UPI')
  const [reference, setReference] = useState('')

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await getPayments()
      setPayments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadPayments() }, [])

  const eligibleInvoices = invoices.filter((invoice) =>
    ['confirmed', 'partially_paid'].includes(invoice.status.toLowerCase()) && Number(invoice.outstanding_amount) > 0
  )
  const selectedInvoice = eligibleInvoices.find((invoice) => String(invoice.id) === invoiceId)
  const totalReceived = payments.filter((payment) => payment.status.toLowerCase() === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0)
  const completedCount = payments.filter((payment) => payment.status.toLowerCase() === 'completed').length
  const averagePayment = completedCount ? totalReceived / completedCount : 0
  const methods = [...new Set(payments.map((payment) => payment.payment_method))]
  const visiblePayments = payments.filter((payment) => {
    const invoice = invoices.find((item) => item.id === payment.invoice_id)
    const needle = query.trim().toLowerCase()
    const matchesQuery = !needle || [String(payment.id), String(payment.invoice_id), invoice?.invoice_number ?? '', payment.transaction_reference ?? '', payment.payment_method]
      .some((value) => value.toLowerCase().includes(needle))
    const matchesMethod = methodFilter === 'All methods' || payment.payment_method === methodFilter
    return matchesQuery && matchesMethod
  })

  const resetForm = () => {
    setInvoiceId(''); setAmount(''); setMethod('UPI'); setReference(''); setFormError(null)
  }

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null); setSuccess(null)
    if (!selectedInvoice) { setFormError('Choose an eligible confirmed invoice.'); return }
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { setFormError('Enter a payment amount greater than zero.'); return }
    if (numericAmount > Number(selectedInvoice.outstanding_amount)) { setFormError(`Amount exceeds the outstanding balance of ${money(selectedInvoice.outstanding_amount)}.`); return }
    setSaving(true)
    try {
      const payment = await createPayment({
        invoice_id: selectedInvoice.id,
        amount: numericAmount,
        payment_method: method,
        transaction_reference: reference.trim() || null,
      })
      setSuccess(`Payment #${payment.id} recorded successfully.`)
      resetForm()
      setFormOpen(false)
      await loadPayments()
      onPaymentSaved()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Payment could not be recorded.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <section className="page-intro payments-intro">
      <div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> FINANCE WORKSPACE / 02</div><h1>Money in motion.<br /><em>Every move, visible.</em></h1><p>A live record of incoming payments, tied back to the invoices they settle.</p></div>
      <div className="page-intro-stat"><span>PAYMENT REGISTER</span><strong>{loading ? '—' : String(payments.length).padStart(2, '0')}</strong><small>Transactions retrieved</small></div>
    </section>

    <section className="payment-metrics">
      <article className="payment-metric payment-metric-featured"><span className="payment-metric-label">TOTAL RECEIVED</span><strong>{loading ? '—' : money(totalReceived)}</strong><small>Completed transactions only</small><span className="payment-metric-icon">↗</span></article>
      <article className="payment-metric"><span className="payment-metric-label">TRANSACTIONS</span><strong>{loading ? '—' : payments.length}</strong><small>All recorded payments</small><span className="payment-metric-icon">▤</span></article>
      <article className="payment-metric"><span className="payment-metric-label">COMPLETED</span><strong>{loading ? '—' : completedCount}</strong><small>Successfully recorded</small><span className="payment-metric-icon">✓</span></article>
      <article className="payment-metric"><span className="payment-metric-label">AVERAGE PAYMENT</span><strong>{loading ? '—' : money(averagePayment)}</strong><small>Across completed payments</small><span className="payment-metric-icon">◷</span></article>
    </section>

    {success && <div className="payment-success" role="status"><span>✓</span>{success}<button onClick={() => setSuccess(null)} aria-label="Dismiss message">×</button></div>}
    <section className="panel payments-register panel">
      <div className="invoice-toolbar payment-toolbar"><div><span className="section-kicker">THE LEDGER</span><h3>Payment activity<span className="heading-dot">.</span></h3><p>Each entry is retrieved directly from your backend.</p></div><div className="invoice-controls payment-controls"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payment, invoice, reference…" /><kbd>/</kbd></label><select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} aria-label="Filter by payment method"><option>All methods</option>{methods.map((item) => <option key={item}>{item}</option>)}</select><button className="payment-primary-button" onClick={() => { setFormOpen((open) => !open); setFormError(null) }}>{formOpen ? 'Close form ×' : '+ Record payment'}</button></div></div>

      {formOpen && <form className="payment-form" onSubmit={submitPayment}>
        <div className="payment-form-heading"><div><span className="section-kicker">NEW TRANSACTION</span><h3>Record a payment<span className="heading-dot">.</span></h3></div><span className="payment-form-note">Only confirmed invoices with a balance are eligible.</span></div>
        <div className="payment-form-grid">
          <label className="payment-field payment-field-wide"><span>INVOICE</span><select required value={invoiceId} onChange={(event) => { setInvoiceId(event.target.value); setAmount('') }} disabled={invoicesLoading || eligibleInvoices.length === 0}><option value="">{invoicesLoading ? 'Loading invoices…' : eligibleInvoices.length ? 'Choose an invoice' : 'No eligible invoices'}</option>{eligibleInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · Customer #{invoice.customer_id} · Due {money(invoice.outstanding_amount)}</option>)}</select>{selectedInvoice && <small>Outstanding balance: <strong>{money(selectedInvoice.outstanding_amount)}</strong></small>}</label>
          <label className="payment-field"><span>AMOUNT (INR)</span><input required type="number" min="0.01" step="0.01" max={selectedInvoice?.outstanding_amount} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
          <label className="payment-field"><span>PAYMENT METHOD</span><select value={method} onChange={(event) => setMethod(event.target.value)}><option>UPI</option><option>Bank Transfer</option><option>Credit Card</option><option>Debit Card</option><option>Cash</option><option>Cheque</option><option>Other</option></select></label>
          <label className="payment-field payment-field-wide"><span>TRANSACTION REFERENCE <small>OPTIONAL</small></span><input maxLength={100} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. UPI reference or bank transaction ID" /></label>
        </div>
        {formError && <div className="payment-form-error" role="alert">! {formError}</div>}
        <div className="payment-form-actions"><span>Payment will be saved as completed by the backend.</span><button className="payment-primary-button" type="submit" disabled={saving || invoicesLoading || eligibleInvoices.length === 0}>{saving ? 'Saving payment…' : 'Confirm payment ↗'}</button></div>
      </form>}

      {error && <div className="inline-alert"><span>!</span><div><strong>Couldn't load payments</strong><small>{error}</small></div><button onClick={() => void loadPayments()}>Try again ↗</button></div>}
      <div className="register-summary"><span><strong>{visiblePayments.length}</strong> results <span className="payment-summary-muted">/ {payments.length} total</span></span><span>FastAPI · /api/payments <span className="pulse-dot" /></span></div>
      {loading ? <div className="skeleton-stack table-skeleton">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div> : !error && visiblePayments.length === 0 ? <div className="empty-state"><div className="empty-orbit"><span>↗</span></div><h4>{payments.length ? 'No matching transactions.' : 'The ledger starts here.'}</h4><p>{payments.length ? 'Try a different search or payment method.' : 'No payments have been recorded yet. Once a payment is saved, it will appear here from your backend.'}</p>{payments.length > 0 ? <button onClick={() => { setQuery(''); setMethodFilter('All methods') }}>Clear filters ↗</button> : <button onClick={() => setFormOpen(true)}>Record first payment ↗</button>}</div> : !error && <div className="table-scroll"><table className="invoice-table payment-table"><thead><tr><th>PAYMENT</th><th>INVOICE / CUSTOMER</th><th>DATE</th><th>METHOD</th><th>REFERENCE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{visiblePayments.map((payment, index) => {
        const invoice = invoices.find((item) => item.id === payment.invoice_id)
        const status = payment.status.toLowerCase() === 'completed' ? 'Completed' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
        return <tr key={payment.id} style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}><td><div className="payment-id"><span className="payment-id-icon">↗</span><strong>PAY-{String(payment.id).padStart(4, '0')}</strong></div></td><td><div className="invoice-identity"><span className="invoice-avatar">{initials(invoice?.invoice_number ?? `Invoice ${payment.invoice_id}`)}</span><span><strong>{invoice?.invoice_number ?? `Invoice #${payment.invoice_id}`}</strong><small>{invoice ? `Customer #${invoice.customer_id}` : `Invoice ID ${payment.invoice_id}`}</small></span></div></td><td>{new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(payment.payment_date))}</td><td><span className="payment-method-pill">{payment.payment_method}</span></td><td className="payment-reference">{payment.transaction_reference || '—'}</td><td className="invoice-amount">{money(payment.amount)}</td><td><StatusBadge status={status} /></td></tr>
      })}</tbody></table></div>}
      <div className="register-footer"><span>Showing {visiblePayments.length} of {payments.length} payments</span><button onClick={() => void loadPayments()}><span className={loading ? 'refresh-spin' : ''}>↻</span> Refresh ledger</button></div>
    </section>
    <Footer />
  </>
}

function MetricCard({ index, title, amount, note, icon, featured = false, warning = false, loading = false }: {
  index: string; title: string; amount: string; note: string; icon: string; featured?: boolean; warning?: boolean; loading?: boolean
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return (
    <article className={`metric-card ${featured ? 'metric-featured' : ''} ${warning ? 'metric-warning' : ''}`} onMouseMove={(event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = event.currentTarget.getBoundingClientRect()
      setTilt({ x: ((event.clientX - rect.left) / rect.width - 0.5) * 5, y: ((event.clientY - rect.top) / rect.height - 0.5) * -5 })
    }} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}>
      <div className="metric-card-glow" /><div className="metric-top"><span className="metric-index">{index} / 04</span><span className="metric-icon">{icon}</span></div>
      <p className="metric-title">{title}</p>
      <div className={`metric-value ${loading ? 'value-loading' : ''}`}>{amount}</div>
      <div className="metric-bottom"><span className="metric-note-dot" /><span>{note}</span><span className="metric-arrow">↗</span></div>
      <span className="metric-watermark">{index}</span>
    </article>
  )
}

function InvoiceTable({ invoices, loading, error, formatMoney, onRetry }: {
  invoices: Invoice[]; loading: boolean; error: string | null; formatMoney: (value: string | number) => string; onRetry: () => void
}) {
  if (loading) return <div className="skeleton-stack table-skeleton">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div>
  if (error) return <EmptyState title="We couldn't reach your invoice register" detail={error} action="Retry connection" onAction={onRetry} />
  if (!invoices.length) return <EmptyState title="A clean slate." detail="No invoices match this view. Create one through your backend workflow and it will appear here." action="Refresh data" onAction={onRetry} />
  return (
    <div className="table-scroll"><table className="invoice-table"><thead><tr><th>INVOICE / CUSTOMER</th><th>ISSUED</th><th>DUE DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead>
      <tbody>{invoices.map((invoice, index) => {
        const status = normalizedStatus(invoice.status, invoice.due_date)
        return <tr key={invoice.id} style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}>
          <td><div className="invoice-identity"><span className="invoice-avatar">{initials(`Customer ${invoice.customer_id}`)}</span><span><strong>{invoice.invoice_number}</strong><small>Customer #{invoice.customer_id}</small></span></div></td>
          <td>{prettyDate(invoice.issue_date)}</td><td>{prettyDate(invoice.due_date)}</td><td className="invoice-amount">{formatMoney(invoice.total_amount)}</td>
          <td><StatusBadge status={status} /></td><td><span className="row-arrow">↗</span></td>
        </tr>
      })}</tbody>
    </table></div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{status}</span>
}

function EmptyState({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-orbit"><span>↗</span></div><h4>{title}</h4><p>{detail}</p><button onClick={onAction}>{action} <span>↗</span></button></div>
}

function ModulePlaceholder({ icon, number, eyebrow, title, description }: { icon: string; number: string; eyebrow: string; title: ReactNode; description: string }) {
  return <><section className="page-intro"><div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> {eyebrow} / {number}</div><h1>{title}</h1><p>{description}</p></div><div className="page-intro-stat"><span>MODULE STATUS</span><strong>SOON<span>.</span></strong><small>Backend integration pending</small></div></section><div className="module-stage"><div className="module-grid" /><div className="module-symbol">{icon}</div><span className="module-orbit module-orbit-a" /><span className="module-orbit module-orbit-b" /><div className="module-copy"><span className="section-kicker">NEXT IN THE WORKSPACE</span><h2>Built to feel effortless.</h2><p>{description}</p><span className="module-progress"><i /></span><small>DESIGNED · AWAITING API CONNECTION</small></div><span className="module-number">{number}</span></div><Footer /></>
}

function Footer() {
  return <footer className="app-footer"><span><span className="footer-mark">b.</span> BRIGHTLOOP SOFTWARE <span className="footer-separator">/</span> FINANCE OS</span><span>Designed for clarity. Built for momentum. <span className="footer-star">✳</span></span></footer>
}

export default App
