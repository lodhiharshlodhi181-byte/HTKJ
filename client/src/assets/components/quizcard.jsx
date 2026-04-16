export default function QuizCard({q}){

return(
<div className="border p-3">

<h3>{q.question}</h3>

{q.options.map((o,i)=>(
<button key={i}>{o}</button>
))}

</div>
)
}