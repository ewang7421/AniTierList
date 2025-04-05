import { Slider } from "@chakra-ui/react";
import {
  smallEntrySize,
  mediumEntrySize,
  largeEntrySize,
} from "@/config/sizes";
import { useSettings } from "@/context/SettingsContext";

export const SizeSlider = () => {
  //TODO: set the initial value of the slider based on the entrysize, and also stuff with localstorage
  const { settings, setSettings } = useSettings();

  const valueSizeMap = new Map<number, { w: number; h: number }>([
    [0, smallEntrySize],
    [50, mediumEntrySize],
    [100, largeEntrySize],
  ]);
  return (
    <Slider.Root
      width="200px"
      //TODO: default value is a bit brittle
      defaultValue={[Number(localStorage.getItem("sizeSlider") ?? 50)]}
      onValueChange={(e) => {
        if (e.value[0] == null) {
          return;
        }
        const newEntrySize = valueSizeMap.get(e.value[0]);

        if (newEntrySize) {
          setSettings({ ...settings, entrySize: newEntrySize });
        }
        localStorage.setItem("sizeSlider", e.value[0].toString());
      }}
      step={50}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  );
};
