import { Footer } from "../components/common/Footer"
import Navbar from "../components/common/NavBar"
import { Outlet } from "react-router-dom"

export default function InstructorDashboard() {
 
 
  return (
    <>
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
      {/* <Footer/> */}
    </>
  )
}
