import * as pug from 'pug';
import * as fs from 'fs';
import moment from 'moment';
import * as pdf from 'html-pdf';
import { listAllSettings, loadSettings } from '@/middlewares/settings';
import { getData } from '@/middlewares/serverData';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import * as dotenv from 'dotenv';

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

interface PdfInfo {
  filename?: string;
  format?: string;
  targetLocation: string;
}

export const generatePdf = async (
  modelName: string,
  info: PdfInfo = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  result: Record<string, unknown>,
  callback?: () => void
) => {
  try {
    const { targetLocation } = info;

    // if PDF already exists, then delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // render pdf html

    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compile Pug template

      const settings = await loadSettings();
      const selectedLang = settings['idurar_app_language'] as string | undefined;
      const translate = useLanguage({ selectedLang });

      const currency_symbol = settings['currency_symbol'] as string | undefined;
      const currency_position = settings['currency_position'] as 'before' | 'after' | undefined;
      const decimal_sep = settings['decimal_sep'] as string | undefined;
      const thousand_sep = settings['thousand_sep'] as string | undefined;
      const cent_precision = settings['cent_precision'] as number | undefined;
      const zero_format = settings['zero_format'] as boolean | undefined;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
      });

      pdf
        .create(htmlContent, {
          format: info.format,
          orientation: 'portrait',
          border: '10mm',
        } as any)
        .toFile(targetLocation, function (error: Error | null) {
          if (error) throw new Error(error.message);
          if (callback) callback();
        });
    }
  } catch (error: any) {
    throw new Error(error);
  }
};

export default {
  generatePdf,
};


