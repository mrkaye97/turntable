'use client'
import { DatabaseZap, Plus } from "lucide-react";
import FullWidthPageLayout from "../../components/layout/FullWidthPageLayout";

import { getResources } from "../actions/actions";

import ConnectionCard from "@/components/connections/connection-card";
import NewConnectionButton from "@/components/connections/new-connection-button";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResourceIcon } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";




const DbtLogo = () => (
    <svg
        width="24px"
        height="24px"
        viewBox="0 0 256 256"
        version="1.1"
        preserveAspectRatio="xMidYMid"
    >
        <g>
            <path
                d="M245.121138,10.6473813 C251.139129,16.4340053 255.074133,24.0723342 256,32.4050489 C256,35.8769778 255.074133,38.1917867 252.990862,42.5895822 C250.907876,46.9873778 225.215147,91.4286933 217.57696,103.696213 C213.179164,110.871609 210.864356,119.435947 210.864356,127.768462 C210.864356,136.3328 213.179164,144.6656 217.57696,151.840996 C225.215147,164.108516 250.907876,208.781084 252.990862,213.179164 C255.074133,217.57696 256,219.659947 256,223.131876 C255.074133,231.464676 251.370667,239.103147 245.352676,244.658347 C239.565938,250.676338 231.927751,254.611342 223.826489,255.305671 C220.35456,255.305671 218.039751,254.379804 213.873493,252.296533 C209.706951,250.213262 164.340053,225.215147 152.072249,217.57696 C151.146382,217.113884 150.220516,216.419556 149.063396,215.95648 L88.4195556,180.079502 C89.8082133,191.652693 94.9006222,202.763093 103.233138,210.864356 C104.853618,212.484551 106.473813,213.873493 108.325547,215.262151 C106.936604,215.95648 105.316409,216.651093 103.927751,217.57696 C91.6599467,225.215147 46.9873778,250.907876 42.5895822,252.990862 C38.1917867,255.074133 36.1085156,256 32.4050489,256 C24.0723342,255.074133 16.4340053,251.370667 10.8788338,245.352676 C4.86075733,239.565938 0.925858133,231.927751 0,223.594951 C0.231464676,220.123022 1.1573248,216.651093 3.00905244,213.641956 C5.09223822,209.24416 30.7848533,164.571307 38.42304,152.303787 C42.82112,145.128391 45.1356444,136.795591 45.1356444,128.231538 C45.1356444,119.6672 42.82112,111.3344 38.42304,104.159004 C30.7848533,91.4286933 4.86075733,46.75584 3.00905244,42.3580444 C1.1573248,39.3489067 0.231464676,35.8769778 0,32.4050489 C0.925858133,24.0723342 4.62930489,16.4340053 10.6473813,10.6473813 C16.4340053,4.62930489 24.0723342,0.925858133 32.4050489,0 C35.8769778,0.231464676 39.3489067,1.1573248 42.5895822,3.00905244 C46.2930489,4.62930489 78.9293511,23.6094009 96.28928,33.7939911 L100.224284,36.1085156 C101.612942,37.0343822 102.770347,37.7287111 103.696213,38.1917867 L105.547947,39.3489067 L167.348907,75.9204978 C165.960249,62.0324978 158.784853,49.3019022 147.674453,40.7378489 C149.063396,40.04352 150.683591,39.3489067 152.072249,38.42304 C164.340053,30.7848533 209.012622,4.86075733 213.410418,3.00905244 C216.419556,1.1573248 219.891484,0.231464676 223.594951,0 C231.696213,0.925858133 239.334684,4.62930489 245.121138,10.6473813 Z M131.240391,144.434062 L144.434062,131.240391 C146.285796,129.388658 146.285796,126.611342 144.434062,124.759609 L131.240391,111.565938 C129.388658,109.714204 126.611342,109.714204 124.759609,111.565938 L111.565938,124.759609 C109.714204,126.611342 109.714204,129.388658 111.565938,131.240391 L124.759609,144.434062 C126.379804,146.054258 129.388658,146.054258 131.240391,144.434062 Z"
                fill="#FF694A"
            ></path>
        </g>
    </svg>
);

const DbtLogoXl = () => (
    <svg
        width="36px"
        height="36px"
        viewBox="0 0 256 256"
        version="1.1"
        preserveAspectRatio="xMidYMid"
    >
        <g>
            <path
                d="M245.121138,10.6473813 C251.139129,16.4340053 255.074133,24.0723342 256,32.4050489 C256,35.8769778 255.074133,38.1917867 252.990862,42.5895822 C250.907876,46.9873778 225.215147,91.4286933 217.57696,103.696213 C213.179164,110.871609 210.864356,119.435947 210.864356,127.768462 C210.864356,136.3328 213.179164,144.6656 217.57696,151.840996 C225.215147,164.108516 250.907876,208.781084 252.990862,213.179164 C255.074133,217.57696 256,219.659947 256,223.131876 C255.074133,231.464676 251.370667,239.103147 245.352676,244.658347 C239.565938,250.676338 231.927751,254.611342 223.826489,255.305671 C220.35456,255.305671 218.039751,254.379804 213.873493,252.296533 C209.706951,250.213262 164.340053,225.215147 152.072249,217.57696 C151.146382,217.113884 150.220516,216.419556 149.063396,215.95648 L88.4195556,180.079502 C89.8082133,191.652693 94.9006222,202.763093 103.233138,210.864356 C104.853618,212.484551 106.473813,213.873493 108.325547,215.262151 C106.936604,215.95648 105.316409,216.651093 103.927751,217.57696 C91.6599467,225.215147 46.9873778,250.907876 42.5895822,252.990862 C38.1917867,255.074133 36.1085156,256 32.4050489,256 C24.0723342,255.074133 16.4340053,251.370667 10.8788338,245.352676 C4.86075733,239.565938 0.925858133,231.927751 0,223.594951 C0.231464676,220.123022 1.1573248,216.651093 3.00905244,213.641956 C5.09223822,209.24416 30.7848533,164.571307 38.42304,152.303787 C42.82112,145.128391 45.1356444,136.795591 45.1356444,128.231538 C45.1356444,119.6672 42.82112,111.3344 38.42304,104.159004 C30.7848533,91.4286933 4.86075733,46.75584 3.00905244,42.3580444 C1.1573248,39.3489067 0.231464676,35.8769778 0,32.4050489 C0.925858133,24.0723342 4.62930489,16.4340053 10.6473813,10.6473813 C16.4340053,4.62930489 24.0723342,0.925858133 32.4050489,0 C35.8769778,0.231464676 39.3489067,1.1573248 42.5895822,3.00905244 C46.2930489,4.62930489 78.9293511,23.6094009 96.28928,33.7939911 L100.224284,36.1085156 C101.612942,37.0343822 102.770347,37.7287111 103.696213,38.1917867 L105.547947,39.3489067 L167.348907,75.9204978 C165.960249,62.0324978 158.784853,49.3019022 147.674453,40.7378489 C149.063396,40.04352 150.683591,39.3489067 152.072249,38.42304 C164.340053,30.7848533 209.012622,4.86075733 213.410418,3.00905244 C216.419556,1.1573248 219.891484,0.231464676 223.594951,0 C231.696213,0.925858133 239.334684,4.62930489 245.121138,10.6473813 Z M131.240391,144.434062 L144.434062,131.240391 C146.285796,129.388658 146.285796,126.611342 144.434062,124.759609 L131.240391,111.565938 C129.388658,109.714204 126.611342,109.714204 124.759609,111.565938 L111.565938,124.759609 C109.714204,126.611342 109.714204,129.388658 111.565938,131.240391 L124.759609,144.434062 C126.379804,146.054258 129.388658,146.054258 131.240391,144.434062 Z"
                fill="#FF694A"
            ></path>
        </g>
    </svg>
);

const TableauLogo = () => (
    <svg
        height="20"
        width="25"
        xmlns=" http://www.w3.org/2000/svg"
        viewBox="0 0 60.3 59.5"
    >
        <path
            d="M28.5 40.2h3.3v-9h8.3V28h-8.3v-9h-3.3v9h-8.2v3.2h8.2z"
            fill="#e8762d"
        />
        <path
            d="M13.2 53.2H16v-8h7.4v-2.5H16v-8.1h-2.8v8.1H5.8v2.5h7.4z"
            fill="#c72037"
        />
        <path
            d="M44.3 24.3h2.8v-8h7.5v-2.4h-7.5V5.8h-2.8v8.1h-7.4v2.4h7.4z"
            fill="#5b879b"
        />
        <path
            d="M29 59.5h2.4v-5.7h5.1v-2.1h-5.1V46H29v5.7h-5v2.1h5z"
            fill="#5c6692"
        />
        <path
            d="M13.3 24.3h2.6v-8.1h7.5v-2.3h-7.5V5.8h-2.6v8.1H5.8v2.3h7.5z"
            fill="#eb9129"
        />
        <path
            d="M52.8 36.3h2.4v-5.6h5.1v-2.2h-5.1v-5.6h-2.4v5.6h-5v2.2h5z"
            fill="#5c6692"
        />
        <path
            clip-rule="evenodd"
            d="M44.3 53.2h2.8v-8h7.5v-2.5h-7.5v-8.1h-2.8v8.1h-7.4v2.5h7.4z"
            fill="#1f457e"
            fill-rule="evenodd"
        />
        <path
            d="M36.1 7.2V5.5h-5V0h-1.8v5.5h-5v1.7h5v5.5h1.8V7.2zM5 35.9h1.8v-5.5h5v-1.7h-5v-5.4H5v5.4H0v1.8l5-.1z"
            fill="#7199a6"
        />
    </svg>
);

const MetabaseLogo = () => (
    <svg
        width="25px"
        height="25px"
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

const LookerLogo = () => (
    <svg
        width="25px"
        height="25px"
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

export default function JobsPage() {
    const router = useRouter();


    function NewJobButton() {

        return (
            <Button
                onClick={() => {
                    router.push("/jobs/new");
                }}
                className="rounded-full space-x-2"
            >
                <Plus className="size-4" />
                <div>New Job</div>
            </Button>
        );
    }

    return (
        <FullWidthPageLayout title="Jobs" button={<NewJobButton />}>
            <div className="flex flex-col space-y-4">
                <Card className="rounded-md hover:border-black hover:cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="mb-1 space-y-1">
                                {getResourceIcon("dbt")}
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle>Product run</CardTitle>
                                    <CardDescription>{`Last ran 47 minutes ago `}</CardDescription>
                                    <CardDescription>{`Scheduled daily at 12pm UTC`}</CardDescription>
                                </div>

                                <div className="float-right space-y-0">
                                    <div className="flex justify-end items-center space-x-2">
                                        <div>
                                            <Badge
                                                variant="secondary"
                                                className="flex space-x-2 items-center font-medium text-sm"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <div>Success</div>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </FullWidthPageLayout >
    );
}
