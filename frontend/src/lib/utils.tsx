import { DbtLogo } from "../components/ActionBar";
import { type ClassValue, clsx } from "clsx"
import { BarChartBig, Database, File, FileIcon, History, LayoutDashboard, PanelsTopLeft } from "lucide-react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DuckDBLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" preserveAspectRatio="xMidYMid meet">
    <defs>
      <clipPath id="__lottie_element_4">
        <rect width="16" height="16" x="0" y="0" />
      </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_4)">
      <g transform="matrix(1,0,0,1,0,0)" opacity="1">
        <g opacity="1" transform="matrix(1,0,0,1,150,150)">
          <path fill="rgb(0,0,0)" fill-opacity="1" d=" M0,148 C0,148 0,148 0,148 C-81.85299682617188,148 -148,81.85399627685547 -148,0 C-148,-81.85399627685547 -81.85299682617188,-148 0,-148 C81.85399627685547,-148 148,-81.85399627685547 148,0 C148,81.85399627685547 81.85399627685547,148 0,148z">
          </path>
        </g>
      </g>
      <g transform="matrix(1,0,0,1,0,0)" opacity="1">
        <g opacity="1" transform="matrix(1,0,0,1,119.19100189208984,150)">
          <path fill="rgb(255,240,0)" fill-opacity="1" d=" M-61.31399917602539,0 C-61.31399917602539,33.827999114990234 -33.827999114990234,61.31399917602539 0,61.31399917602539 C33.82899856567383,61.31399917602539 61.31399917602539,33.827999114990234 61.31399917602539,0 C61.31399917602539,-33.827999114990234 33.82899856567383,-61.31399917602539 0,-61.31399917602539 C-33.827999114990234,-61.31399917602539 -61.31399917602539,-33.827999114990234 -61.31399917602539,0z">
          </path>
        </g>
      </g>
      <g transform="matrix(0.9999901056289673,0,0,1,0.0014801025390625,0)" opacity="1">
        <g opacity="1" transform="matrix(1,0,0,1,225.66099548339844,149.8489990234375)">
          <path fill="rgb(255,240,0)" fill-opacity="1" d=" M3.4739999771118164,-21.898000717163086 C3.4739999771118164,-21.898000717163086 -25.52199935913086,-21.898000717163086 -25.52199935913086,-21.898000717163086 C-25.52199935913086,-21.898000717163086 -25.52199935913086,21.898000717163086 -25.52199935913086,21.898000717163086 C-25.52199935913086,21.898000717163086 3.4739999771118164,21.898000717163086 3.4739999771118164,21.898000717163086 C15.555999755859375,21.898000717163086 25.523000717163086,11.930000305175781 25.523000717163086,-0.1509999930858612 C25.523000717163086,-12.232999801635742 15.555999755859375,-21.898000717163086 3.4739999771118164,-21.898000717163086z">
          </path>
        </g>
      </g>
    </g>
  </svg>
)

const BigQueryLogo = () => (
  <svg
    height="20px"
    width="20px"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"

    viewBox="-1.633235433328256 7.0326093303156565 131.26574682416876 114.63439066968435"
  >
    <linearGradient
      id="a"
      gradientUnits="userSpaceOnUse"
      x1="64"
      x2="64"
      y1="7.034"
      y2="120.789"
    >
      <stop offset="0" stopColor="#4387fd" />
      <stop offset="1" stopColor="#4683ea" />
    </linearGradient>
    <path
      d="M27.79 115.217L1.54 69.749a11.499 11.499 0 0 1 0-11.499l26.25-45.467a11.5 11.5 0 0 1 9.96-5.75h52.5a11.5 11.5 0 0 1 9.959 5.75l26.25 45.467a11.499 11.499 0 0 1 0 11.5l-26.25 45.467a11.5 11.5 0 0 1-9.959 5.749h-52.5a11.499 11.499 0 0 1-9.96-5.75z"
      fill="url(#a)"
    />
    <path
      clipPath="url(#b)"
      d="M119.229 86.48L80.625 47.874 64 43.425l-14.933 5.55L43.3 64l4.637 16.729 40.938 40.938 8.687-.386z"
      opacity=".07"
    />
    <g fill="#fff">
      <path d="M64 40.804c-12.81 0-23.195 10.385-23.195 23.196 0 12.81 10.385 23.195 23.195 23.195S87.194 76.81 87.194 64c0-12.811-10.385-23.196-23.194-23.196m0 40.795c-9.72 0-17.6-7.88-17.6-17.6S54.28 46.4 64 46.4 81.6 54.28 81.6 64 73.72 81.6 64 81.6" />
      <path d="M52.99 63.104v7.21a12.794 12.794 0 0 0 4.38 4.475V63.104zM61.675 57.026v19.411c.745.137 1.507.22 2.29.22.714 0 1.41-.075 2.093-.189V57.026zM70.766 66.1v8.562a12.786 12.786 0 0 0 4.382-4.7v-3.861zM80.691 78.287l-2.403 2.405a1.088 1.088 0 0 0 0 1.537l9.115 9.112a1.088 1.088 0 0 0 1.537 0l2.403-2.402a1.092 1.092 0 0 0 0-1.536l-9.116-9.116a1.09 1.09 0 0 0-1.536 0" />
    </g>
  </svg>
);

export const MetabaseIcon = () => (
  <svg
    width="18px"
    height="18px"
    viewBox="-34 0 324 324"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <g fill="#509EE3">
      <ellipse
        cx="19.3939396"
        cy="82.7565395"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="19.3939396"
        cy="137.927566"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="73.6969698"
        cy="82.7565395"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="73.6969698"
        cy="138.463513"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="128"
        cy="82.7565395"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="128"
        cy="19.703938"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="128"
        cy="138.463513"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="182.30303"
        cy="82.7565395"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="236.60606"
        cy="82.7565395"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="182.30303"
        cy="138.463513"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="236.60606"
        cy="138.463513"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="19.3939396"
        cy="193.098592"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="73.6969698"
        cy="193.634539"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="128"
        cy="193.634539"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="182.30303"
        cy="193.634539"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="236.60606"
        cy="193.634539"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="19.3939396"
        cy="248.269618"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="73.6969698"
        cy="248.805565"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="128"
        cy="248.805565"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="128"
        cy="303.976591"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        opacity="0.2"
        cx="182.30303"
        cy="248.805565"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
      <ellipse
        cx="236.60606"
        cy="248.805565"
        rx="19.3939394"
        ry="19.703938"
      ></ellipse>
    </g>
  </svg>
);

export const TableauIcon = () => (
  <svg
    width="18px"
    height="18px"
    viewBox="0 -2.5 256 256"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <g>
      <polygon
        fill="#7099A6"
        points="123.929417 11.5932444 123.929417 23.2338083 103.108897 23.2338083 103.108897 30.8049067 123.929417 30.8049067 123.929417 53.9913956 132.068348 53.9913956 132.068348 30.8049067 153.409382 30.8049067 153.409382 23.2338083 132.068348 23.2338083 132.068348 0 123.929417 0"
      ></polygon>
      <polygon
        fill="#EB912C"
        points="55.8841702 41.1205283 55.8841702 58.0135416 24.369473 58.0135416 24.369473 68.6130794 55.8841702 68.6130794 55.8841702 102.919619 67.5720533 102.919619 67.5720533 68.6130794 99.5599441 68.6130794 99.5599441 58.0135416 67.5720533 58.0135416 67.5720533 24.2275149 55.8841702 24.2275149"
      ></polygon>
      <polygon
        fill="#59879B"
        points="187.952518 41.1205283 187.952518 58.0135416 156.437821 58.0135416 156.437821 69.1335924 187.952518 69.1335924 187.952518 102.919619 200.113595 102.919619 200.113595 69.1335924 231.628292 69.1335924 231.628292 58.0135416 200.113595 58.0135416 200.113595 24.2275149 187.952518 24.2275149"
      ></polygon>
      <polygon
        fill="#E8762C"
        points="120.900978 98.6608762 120.900978 117.588622 85.8373283 117.588622 85.8373283 131.689793 120.900978 131.689793 120.900978 169.545285 135.096787 169.545285 135.096787 131.689793 170.160437 131.689793 170.160437 117.588622 135.096787 117.588622 135.096787 79.7331302 120.900978 79.7331302"
      ></polygon>
      <polygon
        fill="#5B6591"
        points="224.009874 108.219388 224.009874 120.096549 202.668841 120.096549 202.668841 129.70238 224.009874 129.70238 224.009874 153.409382 234.656731 153.409382 234.656731 129.70238 255.997765 129.70238 255.997765 120.096549 234.656731 120.096549 234.656731 96.3895467 224.009874 96.3895467"
      ></polygon>
      <polygon
        fill="#7099A6"
        points="20.8205206 109.260414 20.8205206 120.617062 0 120.617062 0 128.661354 20.8205206 128.661354 20.8205206 151.374649 28.9594514 151.374649 28.9594514 128.661354 50.3004851 127.904244 50.3004851 120.617062 28.9594514 120.617062 28.9594514 97.9037663 20.8205206 97.9037663"
      ></polygon>
      <polygon
        fill="#C72035"
        points="55.8841702 162.731297 55.8841702 179.62431 24.369473 179.62431 24.369473 190.744361 55.8841702 190.744361 55.8841702 224.530387 68.045247 224.530387 68.045247 190.744361 99.5599441 190.744361 99.5599441 179.62431 68.045247 179.62431 68.045247 145.838283 55.8841702 145.838283"
      ></polygon>
      <polygon
        fill="#1F447E"
        points="187.952518 162.731297 187.952518 179.62431 156.437821 179.62431 156.437821 190.223848 187.952518 190.223848 187.952518 224.530387 200.113595 224.530387 200.113595 190.223848 231.628292 190.223848 231.628292 179.62431 200.113595 179.62431 200.113595 145.838283 187.952518 145.838283"
      ></polygon>
      <polygon
        fill="#5B6591"
        points="122.93571 205.649961 122.93571 217.479802 101.594677 217.479802 101.594677 227.085633 122.93571 227.085633 122.93571 250.792635 133.582568 250.792635 133.582568 227.085633 154.923601 227.085633 154.923601 217.479802 133.582568 217.479802 133.582568 193.7728 122.93571 193.7728"
      ></polygon>
    </g>
  </svg>
);

export const LookerIcon = () => (
  <svg
    width="18px"
    height="18px"
    viewBox="-78.5 0 413 413"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <g>
      <path
        d="M127.128486,0 C113.797782,0.0058471726 101.556004,7.36006381 95.2905253,19.126605 C89.0250469,30.8931461 89.7564532,45.1553578 97.1927396,56.2192339 L112.606279,40.8274339 C112.096845,39.2920176 111.839876,37.6841242 111.845385,36.066411 C111.845385,27.6618072 118.658663,20.8485297 127.063267,20.8485297 C135.467871,20.8485297 142.281148,27.6618072 142.281148,36.066411 C142.281148,44.4710148 135.467871,51.2842924 127.063267,51.2842924 C125.452814,51.2878362 123.852389,51.0308872 122.323984,50.5233983 L106.932184,65.9151983 C119.749817,74.6084738 136.686605,74.1479499 149.012895,64.7709924 C161.339185,55.3940349 166.302744,39.1943452 161.345227,24.5216568 C156.387711,9.84896827 142.61604,-0.0205786569 127.128486,0 L127.128486,0 Z"
        fill="#34A853"
      ></path>
      <path
        d="M112.780303,105.112113 C112.803794,92.9288201 108.858278,81.0693768 101.540706,71.3284161 L81.5400617,91.3073204 C87.7949796,102.747737 85.5440645,116.967804 76.0616244,125.917131 L86.9315396,152.483203 C103.037113,142.110661 112.772753,124.268811 112.780303,105.112113 Z"
        fill="#FBBC04"
      ></path>
      <path
        d="M56.8870939,133.786949 L56.3653379,133.786949 C44.0975407,133.788013 33.1858466,125.990585 29.2128405,114.383946 C25.2398344,102.777307 29.0843199,89.9287712 38.7794013,82.4118404 C48.4744826,74.8949096 61.8756692,74.3722813 72.126715,81.1113398 L91.9317006,61.3063543 C72.6737207,45.6936654 45.4778243,44.4893124 24.9151409,58.3385684 C4.35245741,72.1878245 -4.75374244,97.8421492 2.47549859,121.556363 C9.70473962,145.270576 31.5737,161.482171 56.3653379,161.50524 C60.1906548,161.507115 64.0066702,161.128427 67.7570091,160.374762 L56.8870939,133.786949 Z"
        fill="#EA4335"
      ></path>
      <path
        d="M127.88938,156.76595 C115.371706,156.753269 102.919887,158.577095 90.9316684,162.179168 L106.780005,200.897806 C113.678715,199.188192 120.760254,198.326726 127.86764,198.332506 C169.050784,198.344513 204.491034,227.444917 212.516351,267.838552 C220.541668,308.232187 198.917134,348.670095 160.866351,364.424121 C122.815568,380.178148 78.9350487,366.861058 56.0581359,332.616375 C33.1812232,298.371692 37.6787581,252.735993 66.8004566,223.615929 C72.8771111,217.558264 79.8143655,212.430409 87.3880761,208.398047 L71.7136583,169.788108 C13.2865745,198.402523 -14.3767247,266.297107 7.41546106,327.59645 C29.2076468,388.895793 93.5203541,424.092503 156.898395,409.404661 C220.276436,394.716818 262.550912,334.818559 255.157557,270.182291 C247.764201,205.546024 193.055814,156.741054 127.998079,156.74421 L127.88938,156.76595 Z"
        fill="#4285F4"
      ></path>
    </g>
  </svg>
);

export function getLeafIcon(assetType: string) {
  if (assetType === "model") {
    return <div className="mr-1">
      <DbtLogo />
    </div>
  } else if (assetType === "source") {
    return <Database className='w-4 h-4 mr-1' />
  } else if (assetType === "snapshot") {
    return <History className='w-4 h-4 mr-1' />
  } else if (assetType === "chart") {
    return <BarChartBig className='w-4 h-4 mr-1' />
  } else if (assetType === "dashboard") {
    return <LayoutDashboard className='w-4 h-4 mr-1' />
  } else if (assetType === "dataset") {
    return <PanelsTopLeft className='w-4 h-4 mr-1' />
  }
}

export function getAssetIcon(type: string, resourceType?: string) {
  if (type === 'chart') {
    <BarChartBig className='w-4 h-4 mr-1' />
  }
  if (resourceType === 'looker') {
    return (
      <div className='w-4 h-5 mr-1'>
        <LookerIcon />
      </div>
    )
  }
  if (resourceType === 'duckdb') {
    return <Database className='w-4 h-4 mr-1' />
  }
  if (resourceType === 'bigquery') {
    return <div className='mr-1'><BigQueryLogo /></div>
  }
  if (type === 'source') {
    return <div className='mr-1'><BigQueryLogo /></div>
  } else {
    return (
      <div className="mr-1">
        <DbtLogo />
      </div>
    )
  }
}

export const PostgresLogo = () => (
  <svg width="18px" height="18px" viewBox="-4 0 264 264" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"><path d="M255.008 158.086c-1.535-4.649-5.556-7.887-10.756-8.664-2.452-.366-5.26-.21-8.583.475-5.792 1.195-10.089 1.65-13.225 1.738 11.837-19.985 21.462-42.775 27.003-64.228 8.96-34.689 4.172-50.492-1.423-57.64C233.217 10.847 211.614.683 185.552.372c-13.903-.17-26.108 2.575-32.475 4.549-5.928-1.046-12.302-1.63-18.99-1.738-12.537-.2-23.614 2.533-33.079 8.15-5.24-1.772-13.65-4.27-23.362-5.864-22.842-3.75-41.252-.828-54.718 8.685C6.622 25.672-.937 45.684.461 73.634c.444 8.874 5.408 35.874 13.224 61.48 4.492 14.718 9.282 26.94 14.237 36.33 7.027 13.315 14.546 21.156 22.987 23.972 4.731 1.576 13.327 2.68 22.368-4.85 1.146 1.388 2.675 2.767 4.704 4.048 2.577 1.625 5.728 2.953 8.875 3.74 11.341 2.835 21.964 2.126 31.027-1.848.056 1.612.099 3.152.135 4.482.06 2.157.12 4.272.199 6.25.537 13.374 1.447 23.773 4.143 31.049.148.4.347 1.01.557 1.657 1.345 4.118 3.594 11.012 9.316 16.411 5.925 5.593 13.092 7.308 19.656 7.308 3.292 0 6.433-.432 9.188-1.022 9.82-2.105 20.973-5.311 29.041-16.799 7.628-10.86 11.336-27.217 12.007-52.99.087-.729.167-1.425.244-2.088l.16-1.362 1.797.158.463.031c10.002.456 22.232-1.665 29.743-5.154 5.935-2.754 24.954-12.795 20.476-26.351" /><path d="M237.906 160.722c-29.74 6.135-31.785-3.934-31.785-3.934 31.4-46.593 44.527-105.736 33.2-120.211-30.904-39.485-84.399-20.811-85.292-20.327l-.287.052c-5.876-1.22-12.451-1.946-19.842-2.067-13.456-.22-23.664 3.528-31.41 9.402 0 0-95.43-39.314-90.991 49.444.944 18.882 27.064 142.873 58.218 105.422 11.387-13.695 22.39-25.274 22.39-25.274 5.464 3.63 12.006 5.482 18.864 4.817l.533-.452c-.166 1.7-.09 3.363.213 5.332-8.026 8.967-5.667 10.541-21.711 13.844-16.235 3.346-6.698 9.302-.471 10.86 7.549 1.887 25.013 4.561 36.813-11.958l-.47 1.885c3.144 2.519 5.352 16.383 4.982 28.952-.37 12.568-.617 21.197 1.86 27.937 2.479 6.74 4.948 21.905 26.04 17.386 17.623-3.777 26.756-13.564 28.027-29.89.901-11.606 2.942-9.89 3.07-20.267l1.637-4.912c1.887-15.733.3-20.809 11.157-18.448l2.64.232c7.99.363 18.45-1.286 24.589-4.139 13.218-6.134 21.058-16.377 8.024-13.686h.002" fill="#336791" /><path d="M108.076 81.525c-2.68-.373-5.107-.028-6.335.902-.69.523-.904 1.129-.962 1.546-.154 1.105.62 2.327 1.096 2.957 1.346 1.784 3.312 3.01 5.258 3.28.282.04.563.058.842.058 3.245 0 6.196-2.527 6.456-4.392.325-2.336-3.066-3.893-6.355-4.35M196.86 81.599c-.256-1.831-3.514-2.353-6.606-1.923-3.088.43-6.082 1.824-5.832 3.659.2 1.427 2.777 3.863 5.827 3.863.258 0 .518-.017.78-.054 2.036-.282 3.53-1.575 4.24-2.32 1.08-1.136 1.706-2.402 1.591-3.225" fill="#FFF" /><path d="M247.802 160.025c-1.134-3.429-4.784-4.532-10.848-3.28-18.005 3.716-24.453 1.142-26.57-.417 13.995-21.32 25.508-47.092 31.719-71.137 2.942-11.39 4.567-21.968 4.7-30.59.147-9.463-1.465-16.417-4.789-20.665-13.402-17.125-33.072-26.311-56.882-26.563-16.369-.184-30.199 4.005-32.88 5.183-5.646-1.404-11.801-2.266-18.502-2.376-12.288-.199-22.91 2.743-31.704 8.74-3.82-1.422-13.692-4.811-25.765-6.756-20.872-3.36-37.458-.814-49.294 7.571-14.123 10.006-20.643 27.892-19.38 53.16.425 8.501 5.269 34.653 12.913 59.698 10.062 32.964 21 51.625 32.508 55.464 1.347.449 2.9.763 4.613.763 4.198 0 9.345-1.892 14.7-8.33a529.832 529.832 0 0 1 20.261-22.926c4.524 2.428 9.494 3.784 14.577 3.92.01.133.023.266.035.398a117.66 117.66 0 0 0-2.57 3.175c-3.522 4.471-4.255 5.402-15.592 7.736-3.225.666-11.79 2.431-11.916 8.435-.136 6.56 10.125 9.315 11.294 9.607 4.074 1.02 7.999 1.523 11.742 1.523 9.103 0 17.114-2.992 23.516-8.781-.197 23.386.778 46.43 3.586 53.451 2.3 5.748 7.918 19.795 25.664 19.794 2.604 0 5.47-.303 8.623-.979 18.521-3.97 26.564-12.156 29.675-30.203 1.665-9.645 4.522-32.676 5.866-45.03 2.836.885 6.487 1.29 10.434 1.289 8.232 0 17.731-1.749 23.688-4.514 6.692-3.108 18.768-10.734 16.578-17.36zm-44.106-83.48c-.061 3.647-.563 6.958-1.095 10.414-.573 3.717-1.165 7.56-1.314 12.225-.147 4.54.42 9.26.968 13.825 1.108 9.22 2.245 18.712-2.156 28.078a36.508 36.508 0 0 1-1.95-4.009c-.547-1.326-1.735-3.456-3.38-6.404-6.399-11.476-21.384-38.35-13.713-49.316 2.285-3.264 8.084-6.62 22.64-4.813zm-17.644-61.787c21.334.471 38.21 8.452 50.158 23.72 9.164 11.711-.927 64.998-30.14 110.969a171.33 171.33 0 0 0-.886-1.117l-.37-.462c7.549-12.467 6.073-24.802 4.759-35.738-.54-4.488-1.05-8.727-.92-12.709.134-4.22.692-7.84 1.232-11.34.663-4.313 1.338-8.776 1.152-14.037.139-.552.195-1.204.122-1.978-.475-5.045-6.235-20.144-17.975-33.81-6.422-7.475-15.787-15.84-28.574-21.482 5.5-1.14 13.021-2.203 21.442-2.016zM66.674 175.778c-5.9 7.094-9.974 5.734-11.314 5.288-8.73-2.912-18.86-21.364-27.791-50.624-7.728-25.318-12.244-50.777-12.602-57.916-1.128-22.578 4.345-38.313 16.268-46.769 19.404-13.76 51.306-5.524 64.125-1.347-.184.182-.376.352-.558.537-21.036 21.244-20.537 57.54-20.485 59.759-.002.856.07 2.068.168 3.735.362 6.105 1.036 17.467-.764 30.334-1.672 11.957 2.014 23.66 10.111 32.109a36.275 36.275 0 0 0 2.617 2.468c-3.604 3.86-11.437 12.396-19.775 22.426zm22.479-29.993c-6.526-6.81-9.49-16.282-8.133-25.99 1.9-13.592 1.199-25.43.822-31.79-.053-.89-.1-1.67-.127-2.285 3.073-2.725 17.314-10.355 27.47-8.028 4.634 1.061 7.458 4.217 8.632 9.645 6.076 28.103.804 39.816-3.432 49.229-.873 1.939-1.698 3.772-2.402 5.668l-.546 1.466c-1.382 3.706-2.668 7.152-3.465 10.424-6.938-.02-13.687-2.984-18.819-8.34zm1.065 37.9c-2.026-.506-3.848-1.385-4.917-2.114.893-.42 2.482-.992 5.238-1.56 13.337-2.745 15.397-4.683 19.895-10.394 1.031-1.31 2.2-2.794 3.819-4.602l.002-.002c2.411-2.7 3.514-2.242 5.514-1.412 1.621.67 3.2 2.702 3.84 4.938.303 1.056.643 3.06-.47 4.62-9.396 13.156-23.088 12.987-32.921 10.526zm69.799 64.952c-16.316 3.496-22.093-4.829-25.9-14.346-2.457-6.144-3.665-33.85-2.808-64.447.011-.407-.047-.8-.159-1.17a15.444 15.444 0 0 0-.456-2.162c-1.274-4.452-4.379-8.176-8.104-9.72-1.48-.613-4.196-1.738-7.46-.903.696-2.868 1.903-6.107 3.212-9.614l.549-1.475c.618-1.663 1.394-3.386 2.214-5.21 4.433-9.848 10.504-23.337 3.915-53.81-2.468-11.414-10.71-16.988-23.204-15.693-7.49.775-14.343 3.797-17.761 5.53-.735.372-1.407.732-2.035 1.082.954-11.5 4.558-32.992 18.04-46.59 8.489-8.56 19.794-12.788 33.568-12.56 27.14.444 44.544 14.372 54.366 25.979 8.464 10.001 13.047 20.076 14.876 25.51-13.755-1.399-23.11 1.316-27.852 8.096-10.317 14.748 5.644 43.372 13.315 57.129 1.407 2.521 2.621 4.7 3.003 5.626 2.498 6.054 5.732 10.096 8.093 13.046.724.904 1.426 1.781 1.96 2.547-4.166 1.201-11.649 3.976-10.967 17.847-.55 6.96-4.461 39.546-6.448 51.059-2.623 15.21-8.22 20.875-23.957 24.25zm68.104-77.936c-4.26 1.977-11.389 3.46-18.161 3.779-7.48.35-11.288-.838-12.184-1.569-.42-8.644 2.797-9.547 6.202-10.503.535-.15 1.057-.297 1.561-.473.313.255.656.508 1.032.756 6.012 3.968 16.735 4.396 31.874 1.271l.166-.033c-2.042 1.909-5.536 4.471-10.49 6.772z" fill="#FFF" /></svg>
)

export function getResourceIcon(subtype: string) {
  if (subtype === 'bigquery') {
    return <BigQueryLogo />
  } else if (subtype === 'looker') {
    return <LookerIcon />
  } else if (subtype === 'metabase') {
    return <MetabaseIcon />
  } else if (subtype === 'tableau') {
    return <TableauIcon />
  } else if (subtype === 'dbt') {
    return <DbtLogo />
  } else if (subtype === 'postgres') {
    return <PostgresLogo />
  }
  else {
    return <File className='size-5' />
  }
}