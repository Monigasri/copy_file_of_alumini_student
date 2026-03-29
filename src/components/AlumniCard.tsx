import { User } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Building } from "lucide-react";

interface AlumniCardProps {
  alumni: User;
}

export default function AlumniCard({ alumni }: AlumniCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const alumniId = alumni.id || alumni._id;
    if (!alumniId) return;
    navigate(`/alumni/${alumniId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative z-0 flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* Avatar */}
      {/* Avatar */}
<div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-primary text-xl font-bold text-primary-foreground">
  {alumni.photoUrl && alumni.photoUrl.trim() !== "" ? (
    <img
      src={alumni.photoUrl}
      alt={alumni.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    alumni.name?.charAt(0).toUpperCase()
  )}
</div>

      {/* Details */}
      <div className="w-full">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
          {alumni.name}
        </h3>

        {alumni.profession && (
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            {alumni.profession}
          </div>
        )}

        {alumni.company && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building className="h-3.5 w-3.5" />
            {alumni.company}
          </div>
        )}

        {alumni.location && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {alumni.location}
          </div>
        )}
      </div>

      {/* Experience Badge */}
      {alumni.totalExperience && (
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {alumni.totalExperience} yrs experience
        </span>
      )}
    </button>
  );
}
