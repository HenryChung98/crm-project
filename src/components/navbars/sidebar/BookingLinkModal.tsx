import { Button } from "../../ui/Button";
import { CopyButton } from "@/components/CopyButton";

interface BookingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrgId: string;
}

export const BookingLinkModal = ({ isOpen, onClose, currentOrgId }: BookingLinkModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="p-6 rounded-lg max-w-md w-full bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Select Source</h3>
        <div className="flex flex-col gap-3">
          <CopyButton
            text={`${window.location.origin}/public/booking?org=${currentOrgId}&src=instagram`}
            label="Copy Instagram Booking Link"
            currentOrgId={currentOrgId}
          />
          <CopyButton
            text={`${window.location.origin}/public/booking?org=${currentOrgId}&src=facebook`}
            label="Copy Facebook Booking Link"
            currentOrgId={currentOrgId}
          />
          <CopyButton
            text={`${window.location.origin}/v/${currentOrgId}?src=instagram`}
            label="Copy Instagram Tracking Link"
            currentOrgId={currentOrgId}
          />
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
