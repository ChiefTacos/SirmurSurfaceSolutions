import { DayNightToggle } from "./DayNightToggle";


export const Menu = (props) => {
   const { 
   onSectionChange, 
     menuOpened, 
      setMenuOpened,
     isDay,        // ← RECEIVE
     setIsDay      // ← RECEIVE
  } = props;
  return (
    <>
{/*       <button
  onClick={() => setMenuOpened(!menuOpened)}
  className={`z-20 fixed top-8 right-8 md:top-12 md:right-12 p-3 bg-indigo-600 w-16 h-16 md:w-14 md:w-16 rounded-md 
    transition-transform duration-300 ease-in-out transform ${
      menuOpened ? "rotate-45 translate-y-0.5" : "rotate-0 translate-y-0"
    }`}
> */}
<button
  onClick={() => setMenuOpened(!menuOpened)}
  className={`z-20 fixed top-8 right-8 md:top-12 md:right-12 p-3 w-16 h-16 md:w-16 md:h-16 rounded-md 
    transition-transform duration-300 ease-in-out transform overflow-hidden
    ${menuOpened ? "rotate-45 translate-y-0.5" : "rotate-0 translate-y-0"}`}
>
  <span className="absolute inset-0 animate-rainbow" />

        <div
          className={`bg-black h-1 rounded-md w-full transition-all ${
            menuOpened ? "rotate-45  translate-y-0.5" : ""
          }`}
        />
        <div
          className={`bg-black h-1 rounded-md w-full my-1 ${
            menuOpened ? "hidden" : ""
          }`}
        />
        <div
          className={`bg-black h-1 rounded-md w-full transition-all ${
            menuOpened ? "-rotate-45" : ""
          }`}
        />
      </button>
      <div
        className={`z-10 fixed top-0 right-0 bottom-0 transition-all
          overflow-hidden flex bg-blue flex-col ${
          menuOpened ? "w-80" : "w-0"
        }`}
         style={{

           backgroundColor: "#FFDEE9",
           backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #c3dbff 100%)",
          
         }}
      >
        <div className="flex-1 flex items-start justify-center flex-col gap-12 md:gap-10 mt-10 p-12 md:mt-10 md:p-10">

 {/* fix cheesburger emjoi change to rendered cheeseburger img */}

          <MenuButton label="🌆" onClick={() => onSectionChange(0)} />
          <MenuButton label="Skills" onClick={() => onSectionChange(1)} />
          <MenuButton label="Projects" onClick={() => onSectionChange(2)} />
          <MenuButton label="Contact" onClick={() => onSectionChange(3)} />
          {/* <h2 className="mt-0 p-0 italic overline decoration-dashed decoration-1 ">NAVIGATION</h2> */}

        </div>
{/* DAY/NIGHT TOGGLE — ONLY VISIBLE WHEN MENU IS OPEN */}
          {menuOpened && (
            <div className=" w-full flex justify-center pb-4">
              <DayNightToggle isDay={isDay} setIsDay={setIsDay} />
            </div>
          )}
        <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      {/* <div className="justify-center text-center pt-6">
  <a
    href="/resume.pdf"
    download
    className="group inline-block bg-indigo-600 text-white px-4 py-2 rounded transition transform
               hover:scale-105 hover:shadow-lg hover:bg-indigo-700"
  >
    <span className="transition-all pl-2 ml-2  font-bold">Resume</span>
    <span
      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      📄
    </span>
  </a>
</div> */}

        <div className="justify-center text-center pt-2 mb-2">

        </div>

       <div className="mb-0 pb-0 text-center text-2xl flex flex-col items-center">
  <a href="tel:+12622305182" target="_blank" className="font-bold relative inline-flex items-center">
    
    {/* Phone emoji with hover group */}
    <span className="cursor-pointer relative group text-6xl pb-5">
      <MenuButton label="📞" />
      
      {/* Hidden phone number tooltip */}
      <span
        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap
                   opacity-0 pointer-events-none
                   group-hover:opacity-100 group-hover:pointer-events-auto
                   transition-opacity duration-300
                   bg-black text-white text-sm px-2 py-1 rounded shadow-lg z-50"
      >
        +1 (262) 230 5182
      </span>
    </span>
    
  </a>

  <h3 className="pb-1 pt-2 text-lg text-center">SIRMUR LLC © 2025</h3>
</div>

      </div>
    </>

  );
};

const MenuButton = (props) => {
  const { label, onClick } = props;
  return (
    <button
      onClick={onClick}
      className="text-3xl font-bold cursor-pointer hover:text-indigo-600 transition-colors"
    >
      {label}
    </button>
  );
};
