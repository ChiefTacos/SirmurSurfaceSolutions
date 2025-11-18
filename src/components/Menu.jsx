
import GoogleReviewsBox from './GoogleReviewsBox';


import { DayNightToggle } from "./DayNightToggle";

export const Menu = (props) => {
  const {
    onSectionChange,
    menuOpened,
    setMenuOpened,
    isDay,
    setIsDay,
    reset3D,
    section,
    resetCamera,
    resetOverlays,
  } = props;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;
  console.log('API Key:', apiKey);
  console.log('Place ID:', placeId);
  return (
    <>
      {/* HAMBURGER – always visible on mobile */}
      <button
        onClick={() => setMenuOpened(!menuOpened)}
        className={`
           z-[10000] fixed top-8 right-8 lg:right-12 p-3 w-16 h-16 rounded-md 
          transition-transform duration-300 ease-in-out transform overflow-hidden
          ${menuOpened ? "rotate-45 translate-y-0.5" : "rotate-0 translate-y-0"}
        `}
      >
        <span className="absolute inset-0 animate-rainbow" />
        
        {/* <div className={`bg-black h-1 rounded-md w-full transition-all ${menuOpened ? "rotate-45 translate-y-0.5" : ""}`} /> */}
        {/* <div className={`bg-black h-1 rounded-md w-full my-1 ${menuOpened ? "hidden" : ""}`} /> */}
        {/* <div className={`bg-black h-1 rounded-md w-full transition-all ${menuOpened ? "-rotate-45" : ""}`} /> */}
        
      </button>

      {/* MENU PANEL – mobile only, scrollable */}
      <div
        className={`
           z-[10001] fixed inset-y-0 right-0 transition-all overflow-y-auto
          flex flex-col bg-blue
        `}
        
        style={{
          width: menuOpened
      ? window.innerWidth < 768
        ? "100%" // Mobile: Full width
        : "500px" // Desktop: Fixed width
      : "0px",
          // background: "#7a1a3a",
          // backgroundImage: "linear-gradient(0deg, #4D041A 0%, #4A0A2D 100%)",
        }}
      >
        {/* MENU ITEMS – centered text */}
<div className="flex-1 flex flex-col items-center justify-center gap-12 mt-8">
  <MenuButton label="Home" onClick={() => { onSectionChange(0);     setMenuOpened(false);         
    // resetOverlays();          
      // resetCamera();   
   
  
  }}
   className="text-white text-stroke-black text-5xl font-bold cursor-pointer hover:text-indigo-600 transition-colors" />
  <MenuButton label="Free Quote"   onClick={() => onSectionChange(1)}
   className="text-white text-stroke-black text-5xl font-bold cursor-pointer hover:text-indigo-600 transition-colors" />
  <MenuButton label="Services" onClick={() => onSectionChange(2)}
   className="text-white text-stroke-black text-5xl font-bold cursor-pointer hover:text-indigo-600 transition-colors" />
  <MenuButton label="Contact"  onClick={() => onSectionChange(3)}
   className="text-white text-stroke-black text-5xl font-bold cursor-pointer hover:text-indigo-600 transition-colors" />
</div>

        {/* DAY/NIGHT TOGGLE */}
        {menuOpened && (
          <div className="w-full flex justify-center p-6">
            <DayNightToggle isDay={isDay} setIsDay={setIsDay} />
          </div>
          
        )}
        {/* GOOGLE REVIEWS */}
        {menuOpened && <GoogleReviewsBox placeId={placeId} apiKey={apiKey} />}

        {/* PHONE + COPYRIGHT */}
        <div className="mb-2 pb-0 text-center flex flex-col items-center">
          {/* <a
            href="tel:+12622305182"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold relative inline-flex items-center"
          >
            <button class="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-16 w-64 border text-left p-3 text-gray-50 text-base font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-10 after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg">
  See more
</button>
            <span className="cursor-pointer relative group text-5xl pb-3">
            📞
            
            

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
          </a> */}

          <h3 className="pb-1 pt-1 text-base text-center">Badger Surface Solutions LLC © 2025</h3>
        </div>
      </div>
    </>
  );
};

/* --------------------------------------------------------------- */
// const MenuButton = ({ label, onClick }) => (
//   <button
//     onClick={onClick}
//     className="text-2xl font-bold cursor-pointer hover:text-indigo-600 transition-colors"
//   >
//     {label}
//   </button>
// );



const MenuButton = ({ label, onClick, className }) => (
  <button
    onClick={onClick}
    className={className}
  >
    {label}
  </button>
);