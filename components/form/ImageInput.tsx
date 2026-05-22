import { Input } from "../ui/input";
import { Label } from "../ui/label";

function ImageInput() {
  const name = "image";
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Images (1 to 4)
      </Label>
      <p className="text-sm text-muted-foreground mb-2">
        Select between 1 and 4 images for your property
      </p>
      <Input
        id={name}
        name={name}
        type="file"
        required
        accept="image/*"
        multiple
        className="max-w-xs"
      />
    </div>
  );
}

export default ImageInput;
