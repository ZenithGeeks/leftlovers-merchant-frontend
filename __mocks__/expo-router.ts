export const __mockPush = jest.fn();

export const useRouter = () => ({
  push: __mockPush,
});
