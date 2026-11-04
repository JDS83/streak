// Streak metrics — pure functions shared by index.html and test.html.
// `data` maps "YYYY-MM-DD" -> "good" | "bad"; `today` is local midnight.

const MILESTONES = [
  {n:3,   name:"3 days"},
  {n:7,   name:"1 week"},
  {n:14,  name:"2 weeks"},
  {n:30,  name:"1 month"},
  {n:60,  name:"2 months"},
  {n:90,  name:"3 months"},
  {n:120, name:"4 months"},
  {n:150, name:"5 months"},
  {n:180, name:"6 months"},
  {n:270, name:"9 months"},
  {n:365, name:"1 year"},
];

// ---- date helpers (local time) ----
const fmt = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const parse = k => new Date(k+"T00:00:00");
function startOfToday(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

// ---- metrics ----
// Consecutive "good" days starting at d and stepping by step (-1 = back).
function goodRun(data, d, step){
  let s = 0;
  while(data[fmt(d)] === "good"){ s++; d = addDays(d,step); }
  return s;
}
// Consecutive "good" days counting back from yesterday (today isn't
// editable until it passes). Any day that isn't "good" ends the count.
function currentStreak(data, today){
  return goodRun(data, addDays(today, -1), -1); // most recent completed day = yesterday
}
function bestStreak(data){
  const goods = Object.keys(data).filter(k=>data[k]==="good").sort();
  let best=0, run=0, prev=null;
  for(const k of goods){
    // Compare calendar dates, not milliseconds: DST days are 23h/25h long.
    if(prev && fmt(addDays(parse(prev),1))===k) run++; else run=1;
    best = Math.max(best, run); prev = k;
  }
  return best;
}

// Milestone to celebrate after `key` was set (data already updated), or null.
// When a day becomes good it joins the good runs on either side of it into
// one run. The longer of those neighbouring runs already reached its
// milestones, so only the ones above it count as new (e.g. 12-15 good,
// marking 16 good: 4 -> 5, nothing new; filling a gap between two 2-day
// runs: 2 -> 5, "3 days"). We only celebrate when the joined run is the
// current streak, ending yesterday.
function newMilestone(data, key, today){
  if(data[key] !== "good") return null;
  const day = parse(key);
  const back = goodRun(data, addDays(day,-1), -1), fwd = goodRun(data, addDays(day,1), 1);
  if(fmt(addDays(day, fwd)) !== fmt(addDays(today, -1))) return null;
  const before = Math.max(back, fwd), after = back + 1 + fwd;
  // Celebrate the highest milestone newly crossed by this change.
  const crossed = MILESTONES.filter(m => before < m.n && m.n <= after);
  return crossed.length ? crossed[crossed.length-1] : null;
}

// Progress toward the next milestone, or null once all are reached.
function goalProgress(cur){
  const next = MILESTONES.find(m=>m.n>cur);
  if(!next) return null;
  const prev = [...MILESTONES].reverse().find(m=>m.n<=cur)?.n || 0;
  return { next, left: next.n-cur, pct: Math.round(((cur-prev)/(next.n-prev))*100) };
}
