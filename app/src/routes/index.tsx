import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { StructuredData } from '../components/StructuredData';

function chicagoToday(): string {
  const p = new Intl.DateTimeFormat('en-US',{ timeZone:'America/Chicago', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const date = Object.fromEntries(p.filter(x => x.type !== 'literal').map(x => [x.type,x.value]));
  return date.year+'-'+date.month+'-'+date.day;
}

export const Route = createFileRoute('/')({ head: () => ({ links: [{ rel: 'canonical', href: 'https://ana-international-llc.higgsfield.app/' }] }), component: HomePage });

// Publicly registered carrier information. Keep fleet counts/equipment unspecified:
// secondary carrier directories presently disagree on the reported fleet count.
const verifiedBusiness = {
  name: 'ANA INTERNATIONAL GROUP LLC',
  phone: '(773) 964-5383',
  email: 'mladen@anainternationalgroup.us',
  address: '8726 W Berwyn Ave Apt 1S, Chicago, IL 60656',
  usdot: '4366970',
  mc: '1709791',
  city: 'Chicago, Illinois',
  companyBackground: 'ANA INTERNATIONAL GROUP LLC is listed by the Federal Motor Carrier Safety Administration as an interstate, for-hire motor carrier of property.',
  transportFocus: 'FMCSA records list general freight and utilities among its reported cargo categories.'
};
const fmcsaProfile = 'https://safer.fmcsa.dot.gov/query.asp?query_param=USDOT&query_string=4366970&query_type=queryCarrierSnapshot';
const carrierSourceProfile = 'https://www.carriersource.io/carriers/ana-international-group-llc';
const verifiedServices: { title:string; description:string; icon:string }[] = [
  { title: 'General Freight', description: 'General freight is among the cargo categories listed in public FMCSA records. Share the shipment details to discuss requirements.', icon: '01' },
  { title: 'Interstate Property Transport', description: 'Listed as an interstate for-hire carrier of property. Routes, equipment, pricing and scheduling are confirmed for each requested load.', icon: '02' }
];
const structuredData = JSON.stringify({
  '@context':'https://schema.org',
  '@type':'Organization',
  'name':verifiedBusiness.name,
  'url':'https://ana-international-llc.higgsfield.app',
  'telephone':'+1-773-964-5383',
  'email':verifiedBusiness.email,
  'address': {
    '@type':'PostalAddress',
    'streetAddress':'8726 W Berwyn Ave Apt 1S',
    'addressLocality':'Chicago',
    'addressRegion':'IL',
    'postalCode':'60656',
    'addressCountry':'US'
  },
  'identifier': [
    {'@type':'PropertyValue','name':'USDOT','value':'4366970'},
    {'@type':'PropertyValue','name':'MC','value':'1709791'}
  ],
  'sameAs':[fmcsaProfile]
});
const initialForm = {
  fullName:'', companyName:'', email:'', phone:'',
  pickupCity:'', pickupState:'', pickupZip:'',
  deliveryCity:'', deliveryState:'', deliveryZip:'',
  pickupDate:'', commodity:'', estimatedWeight:'',
  equipmentRequested:'Not sure', additionalDetails:'', website:''
};
type FormKey = keyof typeof initialForm;
type SubmitState = 'idle'|'sending'|'success'|'error';

const required: FormKey[] = ['fullName','email','pickupCity','pickupState','pickupZip','deliveryCity','deliveryState','deliveryZip','pickupDate','commodity'];
const labels: Record<FormKey,string> = {
  fullName:'Full name',companyName:'Company name',email:'Email address',phone:'Phone number',
  pickupCity:'Pickup city',pickupState:'State',pickupZip:'ZIP code',
  deliveryCity:'Delivery city',deliveryState:'State',deliveryZip:'ZIP code',
  pickupDate:'Requested pickup date',commodity:'Commodity',estimatedWeight:'Estimated weight (lbs)',
  equipmentRequested:'Equipment requested',additionalDetails:'Additional shipment details',website:'Website'
};
const equipmentOptions = ['Not sure', 'Dry van', 'Refrigerated trailer', 'Flatbed', 'Other / special equipment'];

function Mark({light=false}:{light?:boolean}){
  return <span aria-hidden="true" className={'brand-emblem'+(light?' brand-emblem-light':'')}>
    <svg viewBox="0 0 52 52" focusable="false"><path d="M5 43 22 7h8l17 36H36l-3.4-8H19.5L16 43H5Zm18-17h6l-3-8-3 8Z" fill="currentColor"/><path d="M7 48h38" stroke="currentColor" strokeWidth="2"/></svg>
  </span>;
}
function ArrowIcon({diagonal=false}:{diagonal?:boolean}){
  return <svg aria-hidden="true" className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={diagonal?"M5 19 19 5M8 5h11v11":"M4 12h15m-6-6 6 6-6 6"}/></svg>;
}
function FreightIcon(){
  return <svg aria-hidden="true" width="65" height="65" viewBox="0 0 65 65" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 40h34V21H8v19Zm34-13h9l7 8v5H42V27ZM8 47h4m12 0h22m12 0h2" /><circle cx="19" cy="43" r="5"/><circle cx="51" cy="43" r="5"/><path d="M15 28h20m-20 6h13"/></svg>;
}
function PinIcon(){
 return <svg aria-hidden="true" width="62" height="62" viewBox="0 0 62 62" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M31 55s-18-16-18-30a18 18 0 0 1 36 0c0 14-18 30-18 30Z"/><circle cx="31" cy="25" r="6"/><path d="M8 54h10m26 0h10"/></svg>;
}

function HomePage(){
 const [menuOpen,setMenuOpen]=useState(false);
 const [data,setData]=useState(initialForm);
 const [errors,setErrors]=useState<Partial<Record<FormKey,string>>>({});
 const [submitState,setSubmitState]=useState<SubmitState>('idle');
 const [serverError,setServerError]=useState('');
 const [reference,setReference]=useState('');
 const closeMenu=()=>setMenuOpen(false);
 const setField=(key:FormKey)=>(event:ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>{
   setData((prev)=>({...prev,[key]:event.target.value}));
   setErrors(prev=>({...prev,[key]:undefined}));
   if(submitState==='error'){setSubmitState('idle');setServerError('');}
 };
 const fieldError=(key:FormKey,v:string)=>{
   if (required.includes(key) && !v.trim()) return labels[key]+' is required.';
   if (key==='email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
   if (key==='fullName' && v && v.trim().length<2) return 'Please enter your first and last name.';
   if(key==='phone' && v && !/^[+()\d.\s-]{7,24}$/.test(v)) return 'Enter a valid phone number.';
   if((key==='pickupState'||key==='deliveryState') && v && !/^[a-zA-Z]{2}$/.test(v)) return 'Use a two-letter state code, like IL.';
   if((key==='pickupZip'||key==='deliveryZip') && v && !/^\d{5}(?:-\d{4})?$/.test(v)) return 'Enter a 5-digit ZIP code.';
   if(key==='pickupDate' && v && v<chicagoToday()) return 'Select today or a future date.';
   if(key==='estimatedWeight' && v && !/^\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s?(?:lbs?|pounds?))?$|^\d+(?:\.\d+)?(?:\s?(?:lbs?|pounds?))?$/i.test(v)) return 'Enter a number of pounds.';
   return '';
 };
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(submitState==='sending')return;
   const next:Partial<Record<FormKey,string>>={};
   for(const key of Object.keys(initialForm) as FormKey[]){
      const error=fieldError(key,data[key]);
      if(error)next[key]=error;
   }
   setErrors(next);
   if(Object.keys(next).length){document.querySelector('[aria-invalid="true"]')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
   setSubmitState('sending');setServerError('');
   try{
     const res=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
     const json=await res.json() as {ok?:boolean;error?:string;message?:string};
     if(!res.ok || !json.ok)throw new Error(json.error||'Unable to submit your request.');
     setReference('Your transportation inquiry has been recorded. A team member can review the details you supplied.');
     setSubmitState('success');
     setData(initialForm);
   }catch(err){
     setServerError(err instanceof Error?err.message:'We could not send your inquiry right now.');
     setSubmitState('error');
   }
 }
 const field=(key:FormKey,opts?:{type?:string;placeholder?:string;autoComplete?:string;min?:string;inputMode?:'numeric';maxLength?:number})=>{
   const id='quote-'+key,hasError=!!errors[key];
   return <div className={'field'+(hasError?' field-invalid':'')} key={key}>
     <label htmlFor={id}>{labels[key]} {required.includes(key)?<span className="required" aria-label="required">*</span>:<span className="optional">Optional</span>}</label>
     <input id={id} name={key} type={opts?.type||'text'} value={data[key]} onChange={setField(key)}
       aria-invalid={hasError} aria-describedby={hasError?id+'-error':undefined}
       required={required.includes(key)} placeholder={opts?.placeholder} autoComplete={opts?.autoComplete}
       min={opts?.min} inputMode={opts?.inputMode} maxLength={opts?.maxLength||200} />
     {hasError&&<small className="field-error" id={id+'-error'} role="alert">{errors[key]}</small>}
   </div>;
 };
 return <>
  <StructuredData json={structuredData}/>
  <a className="skip-link" href="#main">Skip to content</a>
  <header className="site-header">
    <div className="nav-shell">
      <a href="#home" className="wordmark" onClick={closeMenu} aria-label="Ana International Group LLC, home">
        <Mark/><span className="wordmark-copy"><strong>ANA INTERNATIONAL GROUP</strong><small>LLC <i/> FREIGHT TRANSPORTATION</small></span>
      </a>
      <nav id="primary-navigation" aria-label="Main navigation" className={'nav-links'+(menuOpen?' nav-links-open':'')}>
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="/drivers" onClick={closeMenu}>Drivers</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
        <a href="#quote" className="mobile-quote" onClick={closeMenu}>Request a Quote <ArrowIcon/></a>
        {verifiedBusiness.phone&&<a className="mobile-call" href={'tel:'+verifiedBusiness.phone.replace(/[^\d+]/g,'')} onClick={closeMenu}>Call Our Team</a>}
      </nav>
      <a className="nav-quote" href="#quote" onClick={closeMenu}>Request a Quote <ArrowIcon/></a>
      <button type="button" className={'menu-toggle'+(menuOpen?' is-open':'')} onClick={()=>setMenuOpen(x=>!x)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen?'Close menu':'Open menu'}><span/><span/><span/></button>
    </div>
  </header>

  <main id="main">
   <section className="hero" id="home" aria-labelledby="hero-title">
     <img src="/assets/hero-truck.jpg" alt="Illustrative photograph of an American semi-truck on a highway" className="hero-photo" fetchPriority="high"/>
     <div className="hero-shade"/>
     <div className="hero-horizon"/>
     <div className="hero-inner">
        <div className="hero-copy">
           <p className="hero-eyebrow"><span className="hero-line"/> ANA INTERNATIONAL GROUP LLC</p>
           <h1 id="hero-title">Freight Moving.<br/><em>Business Forward.</em></h1>
           <p className="hero-subtitle">Connect with Ana International Group LLC to discuss your freight transportation needs.</p>
           <div className="hero-actions">
             <a className="hero-primary" href="#quote">Request a Quote <ArrowIcon/></a>
             <a className="hero-secondary" href="#contact">Contact Our Team <ArrowIcon diagonal/></a>
           </div>
        </div>
        <div className="hero-bottom">
           <div className="hero-sequence"><span>01</span><span className="seq-track"/><span>04</span></div>
           <p>FREIGHT CONVERSATIONS<br/>START HERE.</p>
        </div>
     </div>
   </section>

   <div className="ticker-band"><div className="ticker-inner">
     <span>YOUR CARGO.</span><span className="ticker-dot"/> <span>YOUR REQUIREMENTS.</span><span className="ticker-dot"/> <span>LET'S TALK TRANSPORTATION.</span>
     <ArrowIcon diagonal/>
   </div></div>

   <section id="about" className="section about-section">
      <div className="content-wrap about-layout">
        <div className="about-media">
          <div className="about-image-frame"><img src="/assets/highway-truck.jpg" loading="lazy" decoding="async" alt="Illustrative image of a commercial truck traveling an American highway"/></div>
          <div className="about-media-label"><span className="graphic-route"><span/><span/><span/></span><span>THE ROAD AHEAD<br/>STARTS WITH A CONVERSATION</span></div>
        </div>
        <div className="about-content">
          <p className="section-eyebrow">ABOUT ANA INTERNATIONAL GROUP LLC</p>
          <h2>Transportation begins with <span>understanding the load.</span></h2>
          <p className="body-lead">Ana International Group LLC welcomes conversations with shippers and freight brokers about their transportation requirements.</p>
          <p className="body-copy">Tell us what you need to move, where it needs to go, and when you would like it picked up. Our team can discuss the details and next steps with you.</p>
          {verifiedBusiness.companyBackground&&<p className="body-copy">{verifiedBusiness.companyBackground}</p>}
          <p className="body-copy">{verifiedBusiness.transportFocus}</p>
          <p className="location-line">Registered location: {verifiedBusiness.city}</p>
          <a href="#quote" className="text-link">Start a freight inquiry <ArrowIcon/></a>
        </div>
      </div>
   </section>

   <section id="services" className="services-section">
     <div className="content-wrap services-content">
       <div className="services-head">
         <div>
           <p className="section-eyebrow section-eyebrow-light">SERVICES &amp; EQUIPMENT</p>
           <h2>Every shipment has<br/><span>its own requirements.</span></h2>
         </div>
         <p>Share your freight and equipment needs. Service details and equipment availability can be discussed directly before any arrangement is confirmed.</p>
       </div>
       <div className="services-cards">{verifiedServices.map((service)=><article className="service-card" key={service.title}><span className="service-index">{service.icon}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div>
       <div className="needs-layout">
         <div className="need-panel need-panel-one">
           <FreightIcon/>
           <div><h3>Shipment details</h3><p>Share your pickup and delivery locations, commodity, estimated weight, and requested pickup date.</p></div>
           <span className="need-index">01 / DETAILS</span>
         </div>
         <div className="need-panel need-panel-two">
           <PinIcon/>
           <div><h3>Equipment requirements</h3><p>Let us know the trailer or equipment you are looking for. If you are unsure, we can start with your load details.</p></div>
           <span className="need-index">02 / DISCUSSION</span>
         </div>
       </div>
       <div className="services-bottom"><span className="services-rule"/><span>Transportation details are subject to direct confirmation.</span><a href="#quote">Describe your shipment <ArrowIcon diagonal/></a></div>
     </div>
   </section>

   <section className="process-section section" id="process">
    <div className="content-wrap">
      <p className="section-eyebrow">HOW IT WORKS</p>
      <div className="process-heading"><h2>Three steps.<br/><span>One clear starting point.</span></h2><p>Start with the facts about your freight. The details can be reviewed before any transportation arrangements are made.</p></div>
      <div className="process-flow" role="list">
        <article role="listitem"><span className="step-number">01</span><span className="step-trace"/><h3>Share your shipment details.</h3><p>Tell us where the freight is going, what it is, and your requested pickup date.</p></article>
        <article role="listitem"><span className="step-number">02</span><span className="step-trace"/><h3>Discuss availability and requirements.</h3><p>Review the load details and any equipment or handling considerations.</p></article>
        <article role="listitem"><span className="step-number">03</span><span className="step-trace"/><h3>Confirm the arrangements.</h3><p>Proceed only after the transportation details have been discussed and agreed.</p></article>
      </div>
    </div>
   </section>

   <section className="credentials-section" id="credentials" aria-label="Carrier credentials">
     <div className="content-wrap credentials-layout">
       <div>
         <p className="section-eyebrow">PUBLIC CARRIER INFORMATION</p>
         <h2>Know who you’re <span>working with.</span></h2>
         <p>ANA INTERNATIONAL GROUP LLC is publicly listed as an interstate motor carrier of property. Verify carrier details directly with FMCSA before booking.</p>
       </div>
       <div className="credential-details">
         <div className="credential-numbers"><div><small>USDOT NUMBER</small><strong>{verifiedBusiness.usdot}</strong></div><div><small>MC NUMBER</small><strong>{verifiedBusiness.mc}</strong></div></div>
         <a href={fmcsaProfile} target="_blank" rel="noopener noreferrer" className="credential-link">View FMCSA carrier record <ArrowIcon diagonal/></a>
         <a href={carrierSourceProfile} target="_blank" rel="noopener noreferrer" className="credential-secondary">Independent carrier profile and reviews <ArrowIcon diagonal/></a>
         <p className="credential-disclaimer">Third-party listing information may change. Refer to FMCSA for current operating authority and safety details.</p>
       </div>
     </div>
   </section>

   <section className="quote-section" id="quote">
     <div className="content-wrap quote-layout">
       <div className="quote-aside">
         <p className="section-eyebrow section-eyebrow-light">REQUEST A FREIGHT QUOTE</p>
         <h2>Tell us about<br/><span>your shipment.</span></h2>
         <p>Send the key details to start a conversation about your transportation request.</p>
         <div className="route-graphic" aria-hidden="true"><span className="route-start"/><span className="route-dash"/><span className="route-arrow">↗</span></div>
         <div className="quote-aside-note"><span>PLEASE NOTE</span><p>Sending a request does not guarantee a price, available equipment, or pickup date. Details must be confirmed directly.</p></div>
       </div>
       <div className="quote-form-shell">
         {submitState==='success'?
          <div className="submit-success" role="status">
            <div className="success-icon">✓</div>
            <p className="form-kicker">INQUIRY RECEIVED</p>
            <h3>Thank you for reaching out.</h3>
            <p>{reference}</p>
            <button type="button" className="another-inquiry" onClick={()=>{setSubmitState('idle');setErrors({});}}>Send another inquiry <ArrowIcon/></button>
          </div>
         :<>
           <div className="form-heading"><h3>Shipment information</h3><p>Fields marked <span className="required">*</span> are required.</p></div>
           <form noValidate onSubmit={submit} className="freight-form">
              <div className="form-part-heading"><span>01</span> Your contact details</div>
              <div className="field-grid">
                {field('fullName',{placeholder:'First and last name',autoComplete:'name'})}
                {field('companyName',{placeholder:'Company name',autoComplete:'organization'})}
                {field('email',{type:'email',placeholder:'name@company.com',autoComplete:'email'})}
                {field('phone',{type:'tel',placeholder:'(555) 000-0000',autoComplete:'tel'})}
              </div>
              <div className="form-part-heading"><span>02</span> Pickup location</div>
              <div className="field-grid field-grid-location">
               {field('pickupCity',{placeholder:'City'})}
               {field('pickupState',{placeholder:'e.g. IL',maxLength:2})}
               {field('pickupZip',{placeholder:'ZIP code',inputMode:'numeric',maxLength:10})}
              </div>
              <div className="form-part-heading"><span>03</span> Delivery location</div>
              <div className="field-grid field-grid-location">
               {field('deliveryCity',{placeholder:'City'})}
               {field('deliveryState',{placeholder:'e.g. TX',maxLength:2})}
               {field('deliveryZip',{placeholder:'ZIP code',inputMode:'numeric',maxLength:10})}
              </div>
              <div className="form-part-heading"><span>04</span> Freight information</div>
              <div className="field-grid">
                {field('pickupDate',{type:'date',min:chicagoToday()})}
                {field('commodity',{placeholder:'Describe the freight'})}
                {field('estimatedWeight',{placeholder:'e.g. 38,000',inputMode:'numeric'})}
                <div className="field">
                 <label htmlFor="equipmentRequested">Equipment requested <span className="required">*</span></label>
                 <select id="equipmentRequested" required value={data.equipmentRequested} onChange={setField('equipmentRequested')}>
                   {equipmentOptions.map(o=><option key={o} value={o}>{o}</option>)}
                 </select>
                </div>
              </div>
              <div className="field field-full">
               <label htmlFor="additionalDetails">Additional shipment details <span className="optional">Optional</span></label>
               <textarea id="additionalDetails" maxLength={2000} rows={4} value={data.additionalDetails} onChange={setField('additionalDetails')} placeholder="Dimensions, special instructions, or anything else we should know."/>
              </div>
              <div className="hidden-trap" aria-hidden="true"><label htmlFor="quote-website">Website</label><input tabIndex={-1} id="quote-website" value={data.website} autoComplete="off" onChange={setField('website')}/></div>
              {submitState==='error'&&<p className="submit-error" role="alert">{serverError}</p>}
              <div className="submit-row"><button className="submit-button" disabled={submitState==='sending'} type="submit">{submitState==='sending'?'Submitting inquiry…':'Submit Freight Inquiry'} {submitState!=='sending'&&<ArrowIcon/>}</button><p>Information is used to review and respond to your freight inquiry.</p></div>
           </form>
         </>}
       </div>
     </div>
   </section>

   <section className="contact-section section" id="contact">
     <div className="content-wrap contact-layout">
      <div className="contact-heading"><p className="section-eyebrow">CONTACT ANA INTERNATIONAL GROUP LLC</p><h2>Start the<br/><span>conversation.</span></h2></div>
      <div className="contact-actions">
        <p>Reach out to discuss your freight transportation needs, or send the shipment details using our quote inquiry form.</p>
        <div className="contact-directory">
          <div><span className="contact-label">CALL OUR TEAM</span><a href={'tel:'+verifiedBusiness.phone.replace(/[^\d+]/g,'')}>{verifiedBusiness.phone}</a></div>
          <div><span className="contact-label">EMAIL</span><a href={'mailto:'+verifiedBusiness.email}>{verifiedBusiness.email}</a></div>
          <div><span className="contact-label">REGISTERED BUSINESS ADDRESS</span><address>{verifiedBusiness.address}</address></div>
        </div>
        <a className="contact-action" href="#quote">Request a Quote <ArrowIcon diagonal/></a>
      </div>
     </div>
   </section>
  </main>
  <footer className="site-footer"><div className="content-wrap">
    <div className="footer-top"><a href="#home" className="wordmark footer-brand"><Mark light/><span className="wordmark-copy"><strong>ANA INTERNATIONAL GROUP</strong><small>LLC <i/> FREIGHT TRANSPORTATION</small></span></a><p>Freight Moving.<br/>Business Forward.</p></div>
    <div className="footer-rule"/>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Ana International Group LLC. All rights reserved.</span>
      <div className="footer-links"><a href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="/drivers">Drivers</a><a href="#quote">Request a Quote</a><a href="#contact">Contact</a></div>
    </div>
    <p className="photo-note">Photography is illustrative and does not depict or represent the company's actual vehicles.</p>
    <div className="footer-facts"><span>{verifiedBusiness.address}</span><a href={'tel:'+verifiedBusiness.phone.replace(/[^\d+]/g,'')}>{verifiedBusiness.phone}</a><a href={'mailto:'+verifiedBusiness.email}>{verifiedBusiness.email}</a></div>
    <p className="footer-registration">USDOT {verifiedBusiness.usdot} · MC {verifiedBusiness.mc} <a href={fmcsaProfile} target="_blank" rel="noopener noreferrer">FMCSA Record <ArrowIcon diagonal/></a></p>
   </div></footer>
 </>;
}
