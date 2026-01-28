
export default function CourseCard({
    course,
}: {
    course: any
    enrolled: boolean
}) {

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h2 className="card-title">{course.title}</h2>
                <p>{course.description}</p>


            </div>
        </div>
    )
}
