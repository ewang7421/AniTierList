import { useLoadedUser } from "@/context/LoadedUserContext";
import { Slider } from "@chakra-ui/react";

const size_small = { w: 80, h: 80 };
const size_medium = { w: 100, h: 140 };
const size_large = { w: 150, h: 210 };

export const SizeSlider = () => {
  const { entrySize, setEntrySize } = useLoadedUser();
  return (
    <Slider.Root
      width="200px"
      onValueChange={(e) => {
        if (e.value[0] == null) {
          return;
        }

        console.log(e.value[0]);

        switch (e.value[0]) {
          case 0:
            setEntrySize(size_small);
            break;
          case 50:
            setEntrySize(size_medium);
            break;
          case 100:
            setEntrySize(size_large);
            break;
        }
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
