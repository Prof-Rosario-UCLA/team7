import type { Citation } from './Home';

interface Props {
  citations: Citation[];
}

export default function CitationList({ citations }: Props) {
  return (
    <div className="p-4 space-y-4 bg-background">
      {citations.map((citation) => (
        <div
          key={citation.id}
          className="rounded-2xl shadow-md p-4 bg-white text-text border-l-4 border-accent transition hover:scale-[1.01] hover:shadow-lg"
        >
          <div className="text-left space-y-1">
            <p><span className="font-semibold text-primary">Violation:</span> {citation.violation}</p>
            <p><span className="font-semibold text-primary">License Plate:</span> {citation.car.license_plate_num}</p>
            <p><span className="font-semibold text-primary">Car:</span> {citation.car.car_color} {citation.car.car_model}</p>
            <p><span className="font-semibold text-primary">Time:</span> {new Date(citation.timestamp).toLocaleString()}</p>
            <p><span className="font-semibold text-primary">Notes:</span> {citation.notes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
