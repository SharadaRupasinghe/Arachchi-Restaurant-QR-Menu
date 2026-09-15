import React, { useState } from 'react';
import { Star, X, MapPin, Share2, Check, MessageSquare, ExternalLink, ThumbsUp, Send } from 'lucide-react';
import { CustomerReview, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: CustomerReview[];
  onSubmitReview: (review: Omit<CustomerReview, 'id' | 'date'>) => Promise<boolean>;
  currentLang: SupportedLanguage;
  tableNumber: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  reviews,
  onSubmitReview,
  currentLang,
  tableNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'rate' | 'reviews'>('rate');
  const [name, setName] = useState('');
  const [table, setTable] = useState(tableNumber || '');
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];

  const availableTags = [
    'Authentic Hot Butter Cuttlefish',
    'Arachchi Kulls Feast',
    'Superb Cheese Kottu',
    'Fast & Friendly Staff',
    'Clean & Welcoming',
    'Generous Portions',
    'Fresh Fruit Juices',
    'Perfect after Anuradhapura Tour',
  ];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const success = await onSubmitReview({
        name: name.trim() || 'Valued Guest',
        tableNumber: table.trim() || undefined,
        overallRating,
        foodRating,
        serviceRating,
        ambianceRating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      if (success) {
        setSubmitted(true);
        setTimeout(() => {
          setActiveTab('reviews');
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareText = encodeURIComponent(
    'Dining at Arachchi Restaurant Anuradhapura! Incredible Arachchi Kulls, Hot Butter Cuttlefish, and Cheese Kottu. Highly recommended when in Anuradhapura!'
  );
  const currentUrl = encodeURIComponent(window.location.href);

  const googleReviewUrl = 'https://www.google.com/maps/search/?api=1&query=Arachchi+Restaurant+Jayanthi+Mawatha+Anuradhapura';
  const tripAdvisorUrl = 'https://www.tripadvisor.com/Search?q=Arachchi+Restaurant+Anuradhapura';
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#18110a] border border-amber-600/40 p-5 sm:p-7 shadow-2xl text-stone-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-100">
              {t.leaveReview}
            </h3>
            <p className="text-xs text-stone-400">
              Arachchi Restaurant Anuradhapura • Jayanthi Mawatha
            </p>
          </div>
        </div>

        {/* External Review Platforms Banner */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-xs font-semibold text-stone-200 transition-all hover:border-amber-500/60 shadow"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>{t.googleReview}</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>
          <a
            href={tripAdvisorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-xs font-semibold text-stone-200 transition-all hover:border-emerald-500/60 shadow"
          >
            <span className="text-emerald-400 font-extrabold text-xs">🦉</span>
            <span>{t.tripAdvisorReview}</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>
        </div>

        {/* Tabs: Write Review vs Guest Reviews */}
        <div className="flex border-b border-stone-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rate')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'rate'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Leave Feedback
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Guest Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'rate' ? (
          submitted ? (
            <div className="py-8 text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-amber-100">Bohoma Sthuthi! Thank You!</h4>
              <p className="text-xs text-stone-300 max-w-sm mx-auto">
                Your feedback helps our kitchen and service team at Arachchi Restaurant Anuradhapura maintain the highest standard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Ratings Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                <div>
                  <div className="text-[11px] text-stone-400 font-medium mb-1">Overall Rating</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setOverallRating(s)}
                        className="text-stone-600 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-stone-400 font-medium mb-1">Food Taste</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFoodRating(s)}
                        className="text-stone-600 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= foodRating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-stone-400 font-medium mb-1">Service Speed</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServiceRating(s)}
                        className="text-stone-600 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= serviceRating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-stone-400 font-medium mb-1">Ambiance</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAmbianceRating(s)}
                        className="text-stone-600 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= ambianceRating ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-amber-300">Quick Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Table Number */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Table No (e.g. 5)"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Comment text */}
              <textarea
                rows={2}
                placeholder="Share your dining experience, dish impressions or hospitality notes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )
        ) : (
          /* Reviews Feed */
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-200">{rev.name}</span>
                    {rev.tableNumber && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-900 text-amber-400 border border-stone-800">
                        {rev.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-xs">{rev.overallRating}</span>
                  </div>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed">{rev.comment}</p>

                {rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-900/40"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-stone-500 pt-0.5">{rev.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Social Sharing Section */}
        <div className="mt-5 pt-4 border-t border-stone-800 space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            {t.shareExperience}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>💬 WhatsApp</span>
            </a>
            <a
              href={fbShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>📘 Facebook</span>
            </a>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Menu Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
