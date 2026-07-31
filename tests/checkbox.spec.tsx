/** @jest-environment jsdom */

// Copyright (C) 2017-2026 Smart code 203358507

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('../src/components/Checkbox/Checkbox.less', () => ({}), { virtual: true });
jest.mock('stremio/components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../src/components/Button', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import Checkbox from '../src/components/Checkbox/Checkbox';

describe('Checkbox', () => {
    test('uses one native, labelled checkbox control', () => {
        const onChange = jest.fn();

        render(
            <Checkbox
                name={'termsAccepted'}
                label={'Read and agree to'}
                link={'Terms of Service'}
                href={'https://www.stremio.com/tos'}
                checked={false}
                onChange={onChange}
            />
        );

        const checkbox = screen.getByRole('checkbox', { name: /Read and agree to Terms of Service/i });
        expect(screen.getAllByRole('checkbox')).toHaveLength(1);
        expect(checkbox.getAttribute('name')).toBe('termsAccepted');

        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ checked: true }));
    });
});
