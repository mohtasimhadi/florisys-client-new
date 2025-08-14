// app/rover/page.tsx
'use client'

import { useMemo } from 'react'
import { useSettings } from '@/lib/settingsStore'
import {
  SignalHigh, SignalLow, Map as MapIcon, Camera, BatteryMedium, BatteryFull,
  Gauge, Activity, ListChecks, ListTodo, TimerReset
} from 'lucide-react'

export default function RoverPage() {
  const { roverBaseUrl } = useSettings()

  const connected = true
  const telemetry = useMemo(() => ({
    speedKph: 3.6,            // ~1 m/s
    heading: 72,              // degrees
    voltage: 48.2,            // V
    currentA: 6.4,            // <-- renamed from "current"
    temperature: 34.5,        // C
    motors: [
      { id: 'FL', rpm: 120, temp: 32, status: 'OK' },
      { id: 'FR', rpm: 118, temp: 33, status: 'OK' },
      { id: 'RL', rpm: 119, temp: 35, status: 'OK' },
      { id: 'RR', rpm: 121, temp: 34, status: 'OK' }
    ],
    batteries: [
      { id: 'A', pct: 78, voltage: 24.1 },
      { id: 'B', pct: 81, voltage: 24.1 }
    ],
    queued: [
      { id: 'q1', label: 'Patrol Row 3 → 5' },
      { id: 'q2', label: 'Inspect anomaly @ 35.104,-97.52' },
      { id: 'q3', label: 'Return to base' }
    ],
    currentTasks: [            // <-- renamed from "current"
      { id: 'c1', label: 'Navigate to waypoint #12' }
    ]
  }), [])

  return (
    <div className="h-[calc(100vh-88px)] overflow-auto bg-gradient-to-b from-sky-50 via-cyan-50 to-teal-50 p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Rover Navigation</h1>
        <span className={[
          'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm',
          connected
            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-red-100 text-red-700 ring-1 ring-red-200'
        ].join(' ')}>
          {connected ? <SignalHigh className="h-4 w-4" /> : <SignalLow className="h-4 w-4" />}
          {connected ? 'Connected' : 'Disconnected'}
        </span>

        <div className="ml-auto rounded-xl border border-sky-200 bg-white/70 px-3 py-1.5 text-xs text-slate-700">
          <span className="opacity-60">Backend:</span>{' '}
          <span className="font-mono">{roverBaseUrl}</span>
        </div>
      </div>

      {/* Top region: Map + Cameras */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* Map */}
        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <MapIcon className="h-5 w-5 text-sky-600" />
            <div className="font-medium">Position Tracking</div>
            <div className="ml-auto text-xs text-slate-500 flex items-center gap-2">
              <TimerReset className="h-4 w-4 text-sky-500" />
              <span>Live</span>
            </div>
          </div>
          <div className="h-[420px] w-full rounded-xl border border-sky-100 bg-gradient-to-br from-sky-100 via-white to-teal-100 grid place-items-center">
            <div className="text-sm text-slate-500">Map placeholder (hook up your OL map here)</div>
          </div>
        </div>

        {/* Cameras */}
        <div className="grid grid-rows-2 gap-4">
          <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Camera className="h-5 w-5 text-sky-600" />
              <div className="font-medium">Dash Cam</div>
            </div>
            <div className="h-[200px] w-full overflow-hidden rounded-xl border border-sky-100 bg-slate-100 grid place-items-center">
              <div className="text-sm text-slate-500">Dash cam stream</div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Camera className="h-5 w-5 text-teal-600" />
              <div className="font-medium">Object Cam</div>
            </div>
            <div className="h-[200px] w-full overflow-hidden rounded-xl border border-sky-100 bg-slate-100 grid place-items-center">
              <div className="text-sm text-slate-500">Object cam stream</div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry & Motors */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Telemetry summary */}
        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <Gauge className="h-5 w-5 text-sky-600" />
            <div className="font-medium">Telemetry</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Speed" value={`${telemetry.speedKph.toFixed(1)} km/h`} />
            <Stat label="Heading" value={`${telemetry.heading}°`} />
            <Stat label="Voltage" value={`${telemetry.voltage.toFixed(1)} V`} />
            <Stat label="Current" value={`${telemetry.currentA.toFixed(1)} A`} />{/* <-- updated */}
            <Stat label="Temperature" value={`${telemetry.temperature.toFixed(1)} °C`} />
          </div>
        </div>

        {/* Motors */}
        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm xl:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <Activity className="h-5 w-5 text-teal-600" />
            <div className="font-medium">Motor Status</div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {telemetry.motors.map(m => (
              <div key={m.id} className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="text-sm font-medium text-slate-700">Motor {m.id}</div>
                  <span className="text-xs text-emerald-600">{m.status}</span>
                </div>
                <div className="text-xs text-slate-500">RPM</div>
                <div className="text-lg font-semibold text-slate-800">{m.rpm}</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400"
                    style={{ width: `${Math.min(100, (m.rpm / 200) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">Temp: {m.temp} °C</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Batteries + Tasks */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Batteries */}
        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <BatteryFull className="h-5 w-5 text-emerald-600" />
            <div className="font-medium">Batteries</div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {telemetry.batteries.map(b => (
              <div key={b.id} className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-700">Battery {b.id}</div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <BatteryMedium className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold">{b.pct}%</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">Voltage: {b.voltage.toFixed(1)} V</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task lists */}
        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <ListTodo className="h-5 w-5 text-sky-600" />
            <div className="font-medium">Queued Tasks</div>
          </div>
          <ul className="space-y-2">
            {telemetry.queued.map(t => (
              <li key={t.id} className="rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-white/80 p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <ListChecks className="h-5 w-5 text-teal-600" />
            <div className="font-medium">Current Task</div>
          </div>
<ul className="space-y-2">
  {telemetry.currentTasks.map((t) => (
    <li
      key={t.id}
      className="rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
    >
      {t.label}
    </li>
  ))}
</ul>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sky-100 bg-white p-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-800">{value}</div>
    </div>
  )
}
