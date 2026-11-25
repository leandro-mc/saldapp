/**
 * Look shared by every text input, select and textarea. 44px tall on touch screens (comfortable
 * target) and 16px text there, because iOS zooms into smaller fields when they get focus.
 */
export const controlClassName =
    'block w-full min-h-11 md:min-h-10 rounded-md border border-gray-400 bg-white px-3 py-2 text-base md:text-sm ' +
    'text-gray-900 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100 ' +
    'aria-invalid:border-red-600 aria-invalid:ring-1 aria-invalid:ring-red-600'
