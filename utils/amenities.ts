import { IconType } from "react-icons";
import {
  FiWifi,
  FiTv,
  FiDroplet,
  FiWind,
  FiTruck,
  FiHome,
  FiCoffee,
  FiSun,
  FiZap,
  FiShield,
  FiMusic,
  FiMapPin,
} from "react-icons/fi";
import {
  MdOutdoorGrill,
  MdOutlinePool,
  MdOutlineKitchen,
  MdOutlineLocalLaundryService,
  MdOutlinePets,
  MdOutlineFireplace,
  MdOutlineBathtub,
  MdOutlineElevator,
} from "react-icons/md";

export type Amenity = {
  name: string;
  icon: IconType;
  selected: boolean;
};

export const amenities: Amenity[] = [
  { name: "WiFi", icon: FiWifi, selected: false },
  { name: "TV", icon: FiTv, selected: false },
  { name: "Kitchen", icon: MdOutlineKitchen, selected: false },
  { name: "Washing machine", icon: MdOutlineLocalLaundryService, selected: false },
  { name: "Free parking", icon: FiTruck, selected: false },
  { name: "Air conditioning", icon: FiWind, selected: false },
  { name: "Heating", icon: MdOutlineFireplace, selected: false },
  { name: "Pool", icon: MdOutlinePool, selected: false },
  { name: "Hot tub", icon: MdOutlineBathtub, selected: false },
  { name: "BBQ grill", icon: MdOutdoorGrill, selected: false },
  { name: "Outdoor furniture", icon: FiSun, selected: false },
  { name: "Coffee maker", icon: FiCoffee, selected: false },
  { name: "Pets allowed", icon: MdOutlinePets, selected: false },
  { name: "Elevator", icon: MdOutlineElevator, selected: false },
  { name: "Security cameras", icon: FiShield, selected: false },
  { name: "Smoke alarm", icon: FiZap, selected: false },
  { name: "First aid kit", icon: FiHome, selected: false },
  { name: "Workspace", icon: FiMusic, selected: false },
  { name: "EV charger", icon: FiMapPin, selected: false },
  { name: "Hot water", icon: FiDroplet, selected: false },
  { name: "Private entrance", icon: FiHome, selected: false },
  { name: "Bidet available", icon: FiDroplet, selected: false },
  { name: "Quiet hours respected", icon: FiMusic, selected: false },
  { name: "Dedicated meditation space", icon: FiSun, selected: false },
  { name: "Compass orientation guide", icon: FiMapPin, selected: false },
  { name: "Alcohol-free environment", icon: FiShield, selected: false },
  { name: "Certified clean kitchen", icon: MdOutlineKitchen, selected: false },
  { name: "Separate spaces for guests", icon: FiHome, selected: false },
  { name: "Family-only bookings available", icon: FiShield, selected: false },
];