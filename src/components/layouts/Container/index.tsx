import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { ToastContainer } from "react-toastify";

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-center bg-contain bg-no-repeat overflow-hidden background-image">
      <ToastContainer toastStyle={{ backgroundColor: "black" }}/>
      <Navbar />
        <div className="w-full md:px-14 md:mt-14 mt-8 px-4 flex flex-grow items-center justify-center flex-col">{children}</div>
      <Footer />
    </div>
  );
};

export default Container;
