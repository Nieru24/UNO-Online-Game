type CardProps = {
  code: string; // e.g. "5R", "D2B", "W"
  size?: number;
};

export default function Card({ code, size = 80}: CardProps) {
  return (
    <img
      src={`/cards/${code}.png`}
      alt={code}
      width={size}
      height={size * 1.5}
      className="object-contain"
    />
  );
}
