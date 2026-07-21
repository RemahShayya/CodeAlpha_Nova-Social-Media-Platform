import { supabase, BUCKET } from '../config/supabase.js';

class SupabaseStorage {
  constructor({ folder }) {
    this.folder = folder;
  }

  _handleFile(req, file, cb) {
    const chunks = [];
    file.stream.on('data', (c) => chunks.push(c));
    file.stream.on('error', cb);
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const ext = file.originalname.split('.').pop();
        const key = `${this.folder}/${req.user.id}-${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(key, buffer, { contentType: file.mimetype, upsert: false });

        if (error) return cb(error);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);

        cb(null, {
          path: data.publicUrl,
          key,
          size: buffer.length,
        });
      } catch (err) {
        cb(err);
      }
    });
  }

  _removeFile(req, file, cb) {
    if (!file.key) return cb(null);
    supabase.storage.from(BUCKET).remove([file.key]).then(() => cb(null), cb);
  }
}

export default (opts) => new SupabaseStorage(opts);