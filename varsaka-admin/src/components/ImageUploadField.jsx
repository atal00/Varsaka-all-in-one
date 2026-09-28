import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ImageUploadField({
  label = 'Featured Image',
  name = 'image',
  value = '',
  onChange,
  bucketFolder = 'blogs',
  required = false,
  helpText = 'Supports JPG, PNG, WEBP (Max 5MB)'
}) {
  const [imageUrl, setImageUrl] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    setImageUrl(value || '');
    if (value) {
      // Preload image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        setMeta({
          dimensions: `${img.naturalWidth} × ${img.naturalHeight}px`,
          url: value
        });
      };
      img.src = value;
    } else {
      setMeta(null);
    }
  }, [value]);

  const validateAndUpload = async (file) => {
    if (!file) return;
    setError(null);

    // 1. File size check (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 5MB limit.`);
      return;
    }

    // 2. Extension check
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!ext || !allowedExts.includes(ext)) {
      setError('Unsupported file extension. Allowed formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    // 3. MIME type check
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      setError(`Invalid MIME type (${file.type}). Allowed: JPG, PNG, WEBP.`);
      return;
    }

    // 4. Inspect binary magic bytes
    try {
      const buffer = await file.slice(0, 12).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let isValidSig = false;

      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        isValidSig = true; // JPEG
      } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        isValidSig = true; // PNG
      } else if (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      ) {
        isValidSig = true; // WEBP
      }

      if (!isValidSig) {
        setError('Security Error: File header does not match a valid image signature. Upload blocked.');
        return;
      }

      // Read dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to read image dimensions.'));
        img.src = objectUrl;
      });

      const dimensions = `${img.naturalWidth} × ${img.naturalHeight}px`;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

      // 5. Generate secure key (prevents path traversal)
      const safeKey = `${bucketFolder}/img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      setUploading(true);

      const { error: uploadErr } = await supabase.storage
        .from('public_assets')
        .upload(safeKey, file, { contentType: file.type, upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('public_assets')
        .getPublicUrl(safeKey);

      // Clean up old image if stored in public_assets
      if (imageUrl && imageUrl.includes('/public_assets/')) {
        const oldKey = imageUrl.split('/public_assets/')[1];
        if (oldKey) {
          supabase.storage.from('public_assets').remove([oldKey]).catch(() => {});
        }
      }

      setImageUrl(publicUrl);
      setMeta({
        name: file.name,
        size: sizeStr,
        dimensions
      });

      if (onChange) onChange(publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (imageUrl && imageUrl.includes('/public_assets/')) {
      const oldKey = imageUrl.split('/public_assets/')[1];
      if (oldKey) {
        supabase.storage.from('public_assets').remove([oldKey]).catch(() => {});
      }
    }
    setImageUrl('');
    setMeta(null);
    setError(null);
    if (onChange) onChange('');
  };

  const inputId = `img-upload-${name}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="modern-form-group full-width" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontWeight: 600, color: 'var(--text-color, #1e293b)', fontSize: '0.9rem' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {meta?.dimensions && (
          <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
            📐 {meta.dimensions} {meta.size ? `• ${meta.size}` : ''}
          </span>
        )}
      </div>

      <input type="hidden" name={name} value={imageUrl} />

      {imageUrl ? (
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem',
          background: '#f8fafc',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <img 
              src={imageUrl} 
              alt={label} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label 
              htmlFor={inputId}
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'background 0.2s ease'
              }}
            >
              <i className="fa-solid fa-arrows-rotate"></i> Replace Image
            </label>
            <input 
              id={inputId}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) validateAndUpload(e.target.files[0]);
              }}
            />

            <button
              type="button"
              onClick={handleRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              <i className="fa-solid fa-trash-can"></i> Remove
            </button>

            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 'auto', wordBreak: 'break-all' }}>
              {imageUrl.split('/').pop()}
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById(inputId)?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#cbd5e1';
            if (e.dataTransfer.files?.[0]) validateAndUpload(e.dataTransfer.files[0]);
          }}
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '2rem 1rem',
            textAlign: 'center',
            background: '#f8fafc',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, background 0.2s ease'
          }}
        >
          <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.2rem', color: '#2563eb', marginBottom: '0.6rem' }}></i>
          <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            Click or drag & drop to upload {label.toLowerCase()}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            {helpText}
          </p>
          <input 
            id={inputId}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) validateAndUpload(e.target.files[0]);
            }}
          />
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: '0.5rem', color: '#2563eb', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-spinner fa-spin"></i> Validating file signature and uploading to CDN storage...
        </div>
      )}

      {error && (
        <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>
      )}
    </div>
  );
}
