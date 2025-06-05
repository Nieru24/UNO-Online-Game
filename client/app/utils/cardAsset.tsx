type CardProps = {
  code: string; // e.g. "5R", "D2B", "W"
  size?: number;
};

export default function Card({ code, size = 80}: CardProps) {
  const cardImage = code === "BACK"
    ? "/cards/Deck.png" // replace with your actual card back image path
    : `/cards/${code}.png`; // or whatever path you use for front cards


  return (
    <img
      src={cardImage}
      alt={code}
      width={size}
      height={size * 1.5}
    />
  );
}
