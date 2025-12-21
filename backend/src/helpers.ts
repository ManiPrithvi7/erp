/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
import * as fs from 'fs';
import currency from 'currency.js';
import moment from 'moment';

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
export { moment };

// Making a static map is really long - this is a handy helper function to make one

// inserting an SVG
export const icon = (name: string): Buffer | null => {
  try {
    return fs.readFileSync(`./public/images/icons/${name}.svg`);
  } catch (error) {
    return null;
  }
};

export const image = (name: string): Buffer => fs.readFileSync(`./public/images/photos/${name}.jpg`);

// Some details about the site
export const siteName = `Express.js / MongoBD / Rest Api`;

export const timeRange = (
  start: string | Date,
  end: string | Date,
  format?: string,
  interval?: number
): string[] => {
  if (format == undefined) {
    format = 'HH:mm';
  }

  if (interval == undefined) {
    interval = 60;
  }
  interval = interval > 0 ? interval : 60;

  const range: string[] = [];
  let currentStart = moment(start);
  const endMoment = moment(end);
  
  while (currentStart.isBefore(endMoment)) {
    range.push(currentStart.format(format));
    currentStart = currentStart.add(interval, 'minutes');
  }
  return range;
};

export const calculate = {
  add: (firstValue: number | string, secondValue: number | string): number => {
    return currency(firstValue).add(secondValue).value;
  },
  sub: (firstValue: number | string, secondValue: number | string): number => {
    return currency(firstValue).subtract(secondValue).value;
  },
  multiply: (firstValue: number | string, secondValue: number | string): number => {
    return currency(firstValue).multiply(secondValue).value;
  },
  divide: (firstValue: number | string, secondValue: number | string): number => {
    return currency(firstValue).divide(secondValue).value;
  },
};

