import { Args, Flags } from '@oclif/core';
import { BaseCommand } from '../../base';
import { Column } from '../../format';
import { uploadFile, UploadedFile } from '../../api/files';

const COLUMNS: Column<UploadedFile>[] = [
  { header: 'ID', get: (f) => String(f.id) },
  { header: 'Name', get: (f) => f.name },
  { header: 'Key', get: (f) => f.key },
  { header: 'Size', get: (f) => String(f.size) },
  { header: 'Disk', get: (f) => f.disk },
  { header: 'Created', get: (f) => f.created_at ?? '' },
];

export default class CommentUpload extends BaseCommand<typeof CommentUpload> {
  static description =
    'Upload one or more files and attach them to a comment. Requires the comment\'s parent card id.';

  static strict = false;

  static examples = [
    '<%= config.bin %> comment:upload 12345 --card 37234 ./screenshot.png',
  ];

  static args = {
    commentId: Args.string({ description: 'Comment ID', required: true }),
  };

  static flags = {
    card: Flags.string({
      summary: 'Card ID the comment belongs to (required).',
      required: true,
    }),
    filename: Flags.string({
      summary: 'Override the filename sent to the server (single-file uploads only).',
    }),
    'mime-type': Flags.string({
      summary: 'Override the MIME type. Defaults to detection from the file extension.',
    }),
  };

  async run(): Promise<void> {
    const { argv, args } = await this.parse(CommentUpload);
    const filePaths = argv.slice(1) as string[];
    if (filePaths.length === 0) this.error('Provide at least one file path.');
    if (this.flags.filename && filePaths.length > 1) {
      this.error('--filename can only be used with a single file.');
    }
    const results: UploadedFile[] = [];
    for (const filePath of filePaths) {
      const result = await uploadFile(this.api, {
        cardId: this.flags.card,
        ownerType: 'Comment',
        ownerId: args.commentId,
        filePath,
        filename: this.flags.filename,
        mimeType: this.flags['mime-type'],
      });
      results.push(result);
    }
    this.output(results, {
      columns: COLUMNS,
      vertical: results.length === 1,
      json: results.length === 1 ? results[0] : results,
    });
  }
}
