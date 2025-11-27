import { Dialog } from '@headlessui/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string; // 👈 URL dari props
}

export default function SuccessModal({ isOpen, onClose, postUrl }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded bg-white p-6 shadow-xl text-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          <h2 id="dialog-title" className="text-lg font-bold text-green-700">Success!</h2>
          
          <p id="dialog-description" className="mt-2 text-sm text-gray-700">
            Your blog post has been successfully published.
          </p>

          {/* 🔗 Link to Post */}
          {postUrl && (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-blue-600 underline hover:text-blue-800"
            >
              View your post
            </a>
          )}
            <br></br>
          <button
            onClick={onClose}
            className="mt-5 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}
