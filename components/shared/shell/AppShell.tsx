import { useState } from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import Header from './Header';
import Drawer from './Drawer';
import { useRouter } from 'next/navigation';
import Brand from './Brand';
import NavBar from '@/components/NavBar/NavBar';

export default function AppShell({ children }) {
  const router = useRouter();
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return;
  }

  return (
    <div>
      <NavBar />
      {/* <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

     
            {children}
         
    </div>
//  <>
//  <div className=" columns-2">
//    <div className="row custom-row">
//      <div className="col-md-6 fixed-column">
//    <div className="lg:pl-64">
//          <Header setSidebarOpen={setSidebarOpen} /> 
//         <main className="py-5">
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             {children}
//           </div>
//         </main>
//       </div>
//        {/* <Sidebar
//          formData={formData}
//          setFormData={setFormData}
//          handleInputChange={handleInputChange}
//          handleAboutChange ={handleAboutChange}
//        /> */}
//      </div>
//      <div className="col-md-6 scrollable-column">
//      <h1>hello I am main contnet</h1>
//        {/* <Theme1
//          componentRef={componentRef}
//          formData={formData}
//          setFormData={setFormData}
//        /> */}
//      </div>
//    </div>
//  </div>
// </>



  );
}
