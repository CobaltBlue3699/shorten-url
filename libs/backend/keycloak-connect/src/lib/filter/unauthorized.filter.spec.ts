import { UnauthorizedFilter } from './unauthorized.filter';

describe('UnauthorizedFilter', () => {
  it('should be defined', () => {
    expect(
      new UnauthorizedFilter({
        clientId: `123`,
        realm: `123`,
        secret: `456`,
      })
    ).toBeDefined();
  });
});
