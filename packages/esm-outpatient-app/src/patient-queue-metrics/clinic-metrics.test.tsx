import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';

import ClinicMetrics from './clinic-metrics.component';
import { mockMetrics } from '../../__mocks__/metrics.mock';
import { waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockServiceTypes } from '../../../../__mocks__/appointments.mock';
import { mockSession } from '../../../../__mocks__/session.mock';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('./queue-metrics.resource.ts', () => {
  const originalModule = jest.requireActual('./queue-metrics.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockImplementation(() => ({ services: mockServiceTypes.data })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLocations: jest.fn().mockImplementation(() => mockLocations.data),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
  };
});

describe('Clinic metrics', () => {
  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({ data: mockMetrics });

    renderMetrics();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Scheduled appts. today/i)).toBeInTheDocument();
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/28/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /see more metrics/i })).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));

    // Select a different service to show metrics for
    expect(screen.getByLabelText(/Select a service/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open menu/i }));
  });
});

function renderMetrics() {
  render(<ClinicMetrics />);
}