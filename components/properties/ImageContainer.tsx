import Image from "next/image";

function ImageContainer({
  mainImage,
  name,
}: {
  mainImage: string;
  name: string;
}) {
  const images = mainImage.split(",").filter(Boolean);
  const firstImage = images[0];
  const otherImages = images.slice(1, 4);

  return (
    <section className="mt-8">
      {images.length === 1 ? (
        <div className="h-[300px] md:h-[500px] relative rounded-xl overflow-hidden">
          <Image
            src={firstImage}
            fill
            sizes="100vw"
            alt={name}
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden h-[300px] md:h-[500px]">
          <div className="relative col-span-1 row-span-2">
            <Image
              src={firstImage}
              fill
              sizes="50vw"
              alt={name}
              className="object-cover"
              priority
            />
          </div>
          <div className={`grid gap-2 ${otherImages.length > 1 ? "grid-rows-2" : "grid-rows-1"}`}>
            {otherImages.map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img}
                  fill
                  sizes="25vw"
                  alt={`${name} ${index + 2}`}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ImageContainer;
