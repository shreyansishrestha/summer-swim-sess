import { useState } from "react";
import "./App.css";

// ── Mini Calendar Component ──
function MultiCalendar({ selectedDates, onChange }) {
  // const today = new Date();
  const minDate = new Date("2026-05-23");
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(4); // 0-indexed, 4 = May

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const toKey = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const isDisabled = (d) => {
    const dt = new Date(viewYear, viewMonth, d);
    return dt < minDate;
  };

  const toggleDate = (d) => {
    if (isDisabled(d)) return;
    const key = toKey(viewYear, viewMonth, d);
    if (selectedDates.includes(key)) {
      onChange(selectedDates.filter(x => x !== key));
    } else {
      onChange([...selectedDates, key].sort());
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button type="button" className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{monthNames[viewMonth]} {viewYear}</span>
        <button type="button" className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const key = toKey(viewYear, viewMonth, d);
          const disabled = isDisabled(d);
          const selected = selectedDates.includes(key);
          return (
            <button
              key={key}
              type="button"
              className={`cal-day ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => toggleDate(d)}
              disabled={disabled}
            >
              {d}
            </button>
          );
        })}
      </div>
      {selectedDates.length > 0 && (
        <div className="cal-selected-list">
          <span className="cal-selected-label">Selected:</span>
          {selectedDates.map(d => (
            <span key={d} className="cal-tag">
              {d}
              <button type="button" className="cal-tag-remove" onClick={() => onChange(selectedDates.filter(x => x !== d))}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "",
    type: "",
    schedule: {
      weekend: [], weekendTime: "",
      weekdays: [], weekdayTime: "",
    },
    swimDates: [],
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [faqOpen, setFaqOpen] = useState(false);

  const toggleWeekend = (day) => {
    setForm(prev => {
      const cur = prev.schedule.weekend;
      return { ...prev, schedule: { ...prev.schedule, weekend: cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day] } };
    });
  };
  const toggleWeekday = (day) => {
    setForm(prev => {
      const cur = prev.schedule.weekdays;
      return { ...prev, schedule: { ...prev.schedule, weekdays: cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day] } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { schedule } = form;
    const hasWeekend = schedule.weekend.length > 0;
    const hasWeekday = schedule.weekdays.length > 0 && schedule.weekdayTime;
    if (!form.name || !form.email || !form.type || (!hasWeekend && !hasWeekday)) {
      alert("Please fill all required fields and pick at least one schedule.");
      return;
    }
    setStatus("sending");

    const schedSummary = [
      hasWeekend ? `Weekends: ${schedule.weekend.join(" & ")}${schedule.weekendTime ? " at " + schedule.weekendTime : ""}` : "",
      hasWeekday ? `Weekdays: ${schedule.weekdays.join(", ")} · ${schedule.weekdayTime}` : "",
    ].filter(Boolean).join(" | ");

    try {
      const res = await fetch("https://formspree.io/f/mdabrjjp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Name: form.name, Email: form.email, Phone: form.phone, Age: form.age,
          "Lesson Type": form.type,
          "Preferred Schedule": schedSummary,
          "Chosen Swim Dates": form.swimDates.length ? form.swimDates.join(", ") : "Not specified",
          "Additional Message": form.message || "None",
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", age: "", type: "", schedule: { weekend: [], weekendTime: "", weekdays: [], weekdayTime: "" }, swimDates: [], message: "" });
      } else setStatus("error");
    } catch { setStatus("error"); }
  };

  const weekdayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="page">
      <div className="bubbles" aria-hidden="true">
        {[...Array(12)].map((_, i) => <span key={i} className={`bubble bubble-${i + 1}`} />)}
      </div>

      <header className="hero">
        <div className="hero-badge">Now Enrolling</div>
        <h1 className="hero-title">
          <span className="title-wave">s w i m</span>
          <span className="title-wave">.LESSONS.</span>
        </h1>
        <p className="hero-sub">by <strong>Shreyansii</strong></p>
        <div className="hero-pills">
          <span className="pill">All Ages</span>
          <span className="pill">All Gender</span>
        </div>
      </header>

      <main className="form-section">
        <div className="form-card">
          <div className="form-header">
            <h2>Apply for Lessons</h2>
            <p>hey, fill in the form and we will reach out to confirm your slot :)</p>
          </div>

          {status === "success" ? (
            <div className="success-box">
              <div className="success-icon">🌊</div>
              <h3>You're In!</h3>
              <p>Your application has been sent. Shreyansii will contact you soon!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* Personal Info */}
              <fieldset>
                <legend>Personal Info</legend>
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="name">Full Name <span className="req">*</span></label>
                    <input id="name" type="text" placeholder="Your full name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label htmlFor="age">Age</label>
                    <input id="age" type="number" placeholder="e.g. 24"
                      value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                  </div>
                </div>
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="email">Email <span className="req">*</span></label>
                    <input id="email" type="email" placeholder="you@example.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" type="tel" placeholder="+977 98XXXXXXXX"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </fieldset>

              {/* Lesson Type */}
              <fieldset>
                <legend>Lesson Type <span className="req">*</span></legend>
                <div className="type-cards">
                  {[
                    { val: "individual", icon: "𖠋", label: "Individual", desc: "" },
                    { val: "group", icon: "𖠋𖠋𖠋", label: "Group", desc: "" },
                  ].map((opt) => (
                    <label key={opt.val} className={`type-card ${form.type === opt.val ? "selected" : ""}`}>
                      <input type="radio" name="type" value={opt.val}
                        checked={form.type === opt.val}
                        onChange={() => setForm({ ...form, type: opt.val })} />
                      <span className="card-icon">{opt.icon}</span>
                      <span className="card-label">{opt.label}</span>
                      <span className="card-desc">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Schedule */}
              <fieldset>
                <legend>Preferred Schedule <span className="req">*</span></legend>
                <p className="field-hint">Pick weekends, weekdays, or both</p>

                {/* Weekend block */}
                <div className="sched-block">
                  <div className="sched-block-title">.Weekends.</div>
                  <div className="sched-day-row">
                    {["Saturday", "Sunday"].map(day => (
                      <label key={day} className={`day-chip ${form.schedule.weekend.includes(day) ? "selected" : ""}`}>
                        <input type="checkbox" checked={form.schedule.weekend.includes(day)} onChange={() => toggleWeekend(day)} />
                        {day}
                      </label>
                    ))}
                  </div>
                 <div className="field" style={{ marginTop: "12px" }}>
  <label>Preferred time</label>
  <select className="styled-select"
    value={form.schedule.weekendTime}
    onChange={(e) => setForm(prev => ({ ...prev, schedule: { ...prev.schedule, weekendTime: e.target.value } }))}>
    <option value="" disabled hidden>Select a time…</option>
    <optgroup label="— Morning —">
      <option value="5:00 AM">5:00 AM</option>
      <option value="6:00 AM">6:00 AM</option>
      <option value="7:00 AM">7:00 AM</option>
      <option value="8:00 AM">8:00 AM</option>
      <option value="9:00 AM">9:00 AM</option>
      <option value="10:00 AM">10:00 AM</option>
      <option value="11:00 AM">11:00 AM</option>
    </optgroup>
    <optgroup label="— Afternoon & Evening —">
      <option value="12:00 PM">12:00 PM</option>
      <option value="1:00 PM">1:00 PM</option>
      <option value="2:00 PM">2:00 PM</option>
      <option value="3:00 PM">3:00 PM</option>
      <option value="4:00 PM">4:00 PM</option>
      <option value="5:00 PM">5:00 PM</option>
      <option value="6:00 PM">6:00 PM</option>
      <option value="7:00 PM">7:00 PM</option>
      <option value="8:00 PM">8:00 PM</option>
      <option value="9:00 PM">9:00 PM</option>
    </optgroup>
  </select>
</div>
                </div>

                {/* Weekday block */}
                <div className="sched-block">
                  <div className="sched-block-title">.Weekdays. </div>
                  <div className="sched-day-row">
                    {weekdayOptions.map(day => (
                      <label key={day} className={`day-chip ${form.schedule.weekdays.includes(day) ? "selected" : ""}`}>
                        <input type="checkbox" checked={form.schedule.weekdays.includes(day)} onChange={() => toggleWeekday(day)} />
                        {day}
                      </label>
                    ))}
                  </div>
                  <div className="field" style={{ marginTop: "12px" }}>
                    <label>Preferred time slot</label>
                    <select className="styled-select"
                      value={form.schedule.weekdayTime}
                      onChange={(e) => setForm(prev => ({ ...prev, schedule: { ...prev.schedule, weekdayTime: e.target.value } }))}>
                      
                      <option value="6–8 AM">6 – 8 AM</option>
                      <option value="6–8 PM">6 – 8 PM</option>
                      <option value="">Both</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Choose Swim Dates */}
              <fieldset>
                <legend>Choose Dates for the Swim</legend>
                <p className="field-hint">Pick one or more dates — available from 24th May 2026</p>
                <MultiCalendar
                  selectedDates={form.swimDates}
                  onChange={(dates) => setForm(prev => ({ ...prev, swimDates: dates }))}
                />
              </fieldset>

              {/* FAQ */}
              <fieldset className="faq-fieldset">
                <legend>FAQ</legend>
                <div className="faq-item">
                  <button type="button" className="faq-toggle" onClick={() => setFaqOpen(!faqOpen)}>
                    <span>What's the price for the session?</span>
                    <span className={`faq-arrow ${faqOpen ? "open" : ""}`}>▾</span>
                  </button>
                  {faqOpen && (
                    <div className="faq-body">
                      <div className="price-row">
                        <span className="price-label">Individual session</span>
                        <span className="price-val">Rs. 850 <span className="price-unit">/ hr per person</span></span>
                      </div>
                      <div className="price-row">
                        <span className="price-label">Group session</span>
                        <span className="price-val">Rs. 750 <span className="price-unit">/ hr per person</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Message */}
              <fieldset>
                <legend>Anything else?</legend>
                <div className="field">
                  <textarea placeholder="Tell Shreyansii about your swimming background, goals, or any questions..."
                    rows={3} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
              </fieldset>

              {status === "error" && (
                <p className="error-msg">Something went wrong. Please try again or email shreyansishrestha@gmail.com directly.</p>
              )}

              <button type="submit" className="submit-btn" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Apply Now "}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Questions? Reach out at <a href="mailto:shreyansishrestha@gmail.com">shreyansishrestha@gmail.com</a></p>
        <p className="footer-copy">© 2026 Swimming Lessons by Shreyansii</p>
      </footer>
    </div>
  );
}



// import { useState } from "react";
// import "./App.css";

// export default function App() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     age: "",
//     type: "",
//     schedule: [],
//     message: "",
//   });
//   const [status, setStatus] = useState("idle"); // idle | sending | success | error

//   const scheduleOptions = [
//     { value: "weekends_sat", label: "Saturday-Sunday", sub: "Weekends" },
//     // { value: "weekends_sun", label: "Sunday", sub: "Weekends" },
//     { value: "weekdays_morning", label: "Mon–Fri { 6–8 AM | PM }", sub: "Weekdays" },
//   ];

//   const handleSchedule = (val) => {
//     setForm((prev) => ({
//       ...prev,
//       schedule: prev.schedule.includes(val)
//         ? prev.schedule.filter((s) => s !== val)
//         : [...prev.schedule, val],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.email || !form.type || form.schedule.length === 0) {
//       alert("Please fill in all required fields.");
//       return;
//     }
//     setStatus("sending");

//     const scheduleLabels = form.schedule
//       .map((v) => scheduleOptions.find((o) => o.value === v)?.label)
//       .join(", ");

//     // Using Formspree — replace YOUR_FORM_ID after setup
//     try {
//       const res = await fetch("https://formspree.io/f/mdabrjjp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({
//           Name: form.name,
//           Email: form.email,
//           Phone: form.phone,
//           Age: form.age,
//           "Lesson Type": form.type,
//           "Preferred Schedule": scheduleLabels,
//           "Additional Message": form.message || "None",
//         }),
//       });
//       if (res.ok) {
//         setStatus("success");
//         setForm({ name: "", email: "", phone: "", age: "", type: "", schedule: [], message: "" });
//       } else {
//         setStatus("error");
//       }
//     } catch {
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="page">
//       {/* Bubbles background */}
//       <div className="bubbles" aria-hidden="true">
//         {[...Array(12)].map((_, i) => <span key={i} className={`bubble bubble-${i + 1}`} />)}
//       </div>

//       <header className="hero">
//         {/* <span className="title-lessons">0</span> */}
//         <div className="hero-badge"> Now Enrolling</div>
//         <h1 className="hero-title">
//           {/* <span className="title-lessons">0</span> */}
//           <span className="title-wave">s w i m</span>
//           <span className="title-wave">.LESSONS.</span>
//           {/* <span className="title-wave">Lessons</span> */}
//           {/* <span className="title-lessons">L E S S O N S</span> */}
//         </h1>
//         <p className="hero-sub">by <strong>Shreyansii</strong></p>
//         {/* <p className="hero-tagline">Dive in, build confidence, and fall in love with the water ✨</p> */}
//         <div className="hero-pills">
//           <span className="pill">All Ages</span>
//           <span className="pill">All Gender</span>
//           {/* <span className="pill">🏅 Beginner–Advanced</span> */}
//           {/* <span className="pill">Kathmandu</span> */}
//         </div>
//       </header>

//       <main className="form-section">
//         <div className="form-card">
//           <div className="form-header">
//             <h2>Apply for Lessons</h2>
//             <p>hey, fill in the form and we will reach out to confirm your slot :) </p>
//           </div>

//           {status === "success" ? (
//             <div className="success-box">
//               <div className="success-icon">🌊</div>
//               <h3>You're In!</h3>
//               <p>Your application has been sent. Shreyansii will contact you soon!</p>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} noValidate>
//               {/* Personal Info */}
//               <fieldset>
//                 <legend>Personal Info</legend>
//                 <div className="row-2">
//                   <div className="field">
//                     <label htmlFor="name">Full Name <span className="req">*</span></label>
//                     <input
//                       id="name" type="text" placeholder="Your full name"
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="field">
//                     <label htmlFor="age">Age</label>
//                     <input
//                       id="age" type="number" placeholder="e.g. 24"
//                       value={form.age}
//                       onChange={(e) => setForm({ ...form, age: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <div className="row-2">
//                   <div className="field">
//                     <label htmlFor="email">Email <span className="req">*</span></label>
//                     <input
//                       id="email" type="email" placeholder="you@example.com"
//                       value={form.email}
//                       onChange={(e) => setForm({ ...form, email: e.target.value })}
//                       required
//                     />
//                   </div>
//                   <div className="field">
//                     <label htmlFor="phone">Phone</label>
//                     <input
//                       id="phone" type="tel" placeholder="+977 98XXXXXXXX"
//                       value={form.phone}
//                       onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               </fieldset>

//               {/* Lesson Type */}
//               <fieldset>
//                 <legend>Lesson Type <span className="req">*</span></legend>
//                 <div className="type-cards">
//                   {[
//                     { val: "individual", icon: "𖠋", label: "Individual", desc: "" },
//                     { val: "group", icon: "𖠋𖠋𖠋", label: "Group", desc: "" },
//                   ].map((opt) => (
//                     <label key={opt.val} className={`type-card ${form.type === opt.val ? "selected" : ""}`}>
//                       <input
//                         type="radio" name="type" value={opt.val}
//                         checked={form.type === opt.val}
//                         onChange={() => setForm({ ...form, type: opt.val })}
//                       />
//                       <span className="card-icon">{opt.icon}</span>
//                       <span className="card-label">{opt.label}</span>
//                       <span className="card-desc">{opt.desc}</span>
//                     </label>
//                   ))}
//                 </div>
//               </fieldset>

//               {/* Schedule */}
//               <fieldset>
//                 <legend>Preferred Schedule <span className="req">*</span></legend>
//                 <p className="field-hint">Select all that work for you</p>
//                 <div className="schedule-grid">
//                   {scheduleOptions.map((opt) => (
//                     <label key={opt.value} className={`schedule-card ${form.schedule.includes(opt.value) ? "selected" : ""}`}>
//                       <input
//                         type="checkbox"
//                         checked={form.schedule.includes(opt.value)}
//                         onChange={() => handleSchedule(opt.value)}
//                       />
//                       <span className="sched-sub">{opt.sub}</span>
//                       <span className="sched-label">{opt.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </fieldset>

//               {/* Message */}
//               <fieldset>
//                 <legend>Anything else?</legend>
//                 <div className="field">
//                   <textarea
//                     placeholder="Tell Shreyansii about your swimming background, goals, or any questions..."
//                     rows={3}
//                     value={form.message}
//                     onChange={(e) => setForm({ ...form, message: e.target.value })}
//                   />
//                 </div>
//               </fieldset>

//               {status === "error" && (
//                 <p className="error-msg">Something went wrong. Please try again or email shreyansishrestha@gmail.com directly.</p>
//               )}

//               <button type="submit" className="submit-btn" disabled={status === "sending"}>
//                 {status === "sending" ? "Sending…" : "Apply Now 🌊"}
//               </button>
//             </form>
//           )}
//         </div>
//       </main>

//       <footer className="footer">
//         <p>Questions? Reach out at <a href="mailto:shreyansishrestha@gmail.com">shreyansishrestha@gmail.com</a></p>
//         <p className="footer-copy">© 2026 Swimming Lessons by Shreyansii</p>
//       </footer>
//     </div>
//   );
// }