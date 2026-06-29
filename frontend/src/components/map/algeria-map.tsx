'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet'
import type { Map as LeafletMap, PathOptions, LeafletMouseEvent } from 'leaflet'
import { cn } from '@/lib/utils'
import { algeriaProvinces } from '@/lib/algeria-geojson'
import { getProvinceByCode } from '@/lib/mock-data'
import { ProvinceTooltip } from './province-tooltip'
import type { Province } from '@/lib/mock-data'

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

function getScoreFillColor(score: number): string {
  if (score >= 90) return '#06b6d4'
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

interface AlgeriaMapProps {
  onProvinceSelect: (code: string) => void
  selectedProvince?: string
  className?: string
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

function MapContent({
  onProvinceSelect,
  selectedProvince,
  onHover,
}: {
  onProvinceSelect: (code: string) => void
  selectedProvince?: string
  onHover: (province: Province | null, pos?: { x: number; y: number }) => void
}) {
  const map = useMap()
  const geoJsonRef = useRef<any>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    containerRef.current = map.getContainer().parentElement
  }, [map])

  useEffect(() => {
    map.fitBounds([
      [19.0, -8.5],
      [37.5, 12.0],
    ])
  }, [map])

  const styleFeature = useCallback(
    (feature: any): PathOptions => {
      if (!feature?.properties) return {}
      const code = feature.properties.code
      const province = getProvinceByCode(code)
      const score = province?.compositeScore
      const isSelected = code === selectedProvince

      return {
        fillColor: score != null ? getScoreFillColor(score) : '#6b7280',
        weight: isSelected ? 2 : 0.5,
        color: isSelected ? '#fff' : '#374151',
        fillOpacity: score != null ? 0.8 : 0.25,
        opacity: 1,
      }
    },
    [selectedProvince],
  )

  const onEachFeature = useCallback(
    (feature: any, layer: any) => {
      const code = feature?.properties?.code

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const province = getProvinceByCode(code)
          if (!province) return

          layer.setStyle({ fillOpacity: 1, weight: 1.5, color: '#fff' })
          layer.bringToFront()

          const container = containerRef.current
          if (container) {
            const rect = container.getBoundingClientRect()
            onHover(province, {
              x: e.originalEvent.clientX - rect.left,
              y: e.originalEvent.clientY - rect.top,
            })
          }
        },
        mousemove: (e: LeafletMouseEvent) => {
          const province = getProvinceByCode(code)
          if (!province) return

          const container = containerRef.current
          if (container) {
            const rect = container.getBoundingClientRect()
            onHover(province, {
              x: e.originalEvent.clientX - rect.left,
              y: e.originalEvent.clientY - rect.top,
            })
          }
        },
        mouseout: () => {
          onHover(null)
          if (geoJsonRef.current) {
            geoJsonRef.current.resetStyle(layer)
          }
        },
        click: () => {
          onProvinceSelect(code)
        },
      })
    },
    [onProvinceSelect, onHover],
  )

  return (
    <GeoJSON
      ref={geoJsonRef}
      data={algeriaProvinces as any}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  )
}

export function AlgeriaMap({
  onProvinceSelect,
  selectedProvince,
  className,
}: AlgeriaMapProps) {
  const [isDark, setIsDark] = useState(isDarkMode)
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(isDarkMode())
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleHover = useCallback(
    (province: Province | null, pos?: { x: number; y: number }) => {
      setHoveredProvince(province)
      if (pos) setTooltipPos(pos)
    },
    [],
  )

  return (
    <div ref={wrapperRef} className={cn('relative h-full w-full overflow-hidden rounded-xl', className)}>
      <MapContainer
        center={[28, 3]}
        zoom={5}
        zoomControl={false}
        className="h-full w-full"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer key={isDark ? 'dark' : 'light'} url={isDark ? DARK_TILE_URL : LIGHT_TILE_URL} attribution={ATTRIBUTION} />
        <ZoomControl position="bottomright" />
        <MapContent
          onProvinceSelect={onProvinceSelect}
          selectedProvince={selectedProvince}
          onHover={handleHover}
        />
      </MapContainer>

      {hoveredProvince && (
        <ProvinceTooltip province={hoveredProvince} position={tooltipPos} />
      )}
    </div>
  )
}
