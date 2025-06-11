import type { Citation } from './Home';

interface Props {
  citations: Citation[];
}

function renderMedia(citation: Citation) {
    if (!citation.media_type) return null;
  
    const mediaUrl = `/api/citations/${citation.id}/media`;
    const { license_plate_num, car_color, car_model } = citation.car;
    const altText = `Evidence for ${citation.violation} violation by a car (${car_color} ${car_model}), license plate ${license_plate_num}`;
  
    if (citation.media_type.startsWith('image/')) {
      return (
        <img
          src={mediaUrl}
          alt={altText}
          className="w-full h-auto max-h-64 object-cover rounded-xl mb-2"
          onError={(e) => {
            console.error('Failed to load image:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } else if (citation.media_type.startsWith('video/')) {
      return (
        <video
          src={mediaUrl}
          controls
          className="w-full h-auto max-h-64 rounded-xl mb-2"
          onError={(e) => {
            console.error('Failed to load video:', e);
            e.currentTarget.style.display = 'none';
          }}
        >
          Your browser does not support the video tag. {altText}
        </video>
      );
    }
  
    return null;
  }
  

export default function CitationList({ citations }: Props) {
  return (
    <div className="p-4 space-y-4 bg-background">
      {citations.map((citation) => (
        <article
            key={citation.id}
            className="rounded-2xl shadow-md p-4 bg-white text-text border-l-4 border-accent transition hover:scale-[1.01] hover:shadow-lg"
            >
            {renderMedia(citation)}
            <div className="text-left space-y-1">
                <p><strong className="text-primary">Violation:</strong> {citation.violation}</p>
                <p><strong className="text-primary">License Plate:</strong> {citation.car.license_plate_num}</p>
                <p><strong className="text-primary">Car:</strong> {citation.car.car_color} {citation.car.car_model}</p>
                <p><strong className="text-primary">Time:</strong> {new Date(citation.timestamp).toLocaleString()}</p>
                {citation.notes && (
                <p><strong className="text-primary">Notes:</strong> {citation.notes}</p>
                )}
            </div>
        </article>
      ))}
    </div>
  );
}
