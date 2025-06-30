//src/components/simulation/DataCollector.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Download, 
  Trash2, 
  BarChart3, 
  FileText,
  Calculator
} from 'lucide-react';
import type { MeasurementData } from '@/types/simulation';

interface DataCollectorProps {
  measurements: MeasurementData[];
  onAddMeasurement: (measurement: MeasurementData) => void;
}

export function DataCollector({ measurements, onAddMeasurement }: DataCollectorProps) {
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    name: '',
    value: '',
    unit: '',
    notes: '',
  });

  const handleAddMeasurement = () => {
    if (!newMeasurement.name || !newMeasurement.value) return;

    const measurement: MeasurementData = {
      id: crypto.randomUUID(),
      name: newMeasurement.name,
      value: parseFloat(newMeasurement.value),
      unit: newMeasurement.unit,
      timestamp: new Date(),
      notes: newMeasurement.notes || undefined,
    };

    onAddMeasurement(measurement);
    setNewMeasurement({ name: '', value: '', unit: '', notes: '' });
    setIsAddingMeasurement(false);
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Value', 'Unit', 'Timestamp', 'Notes'],
      ...measurements.map(m => [
        m.name,
        m.value.toString(),
        m.unit,
        m.timestamp.toISOString(),
        m.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    if (measurements.length === 0) return null;

    const values = measurements.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: values.length,
      sum,
      mean,
      min: Math.min(...values),
      max: Math.max(...values),
      stdDev,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-4">
      {/* Data Collection Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Data Collection
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingMeasurement(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportData}
                disabled={measurements.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{measurements.length}</div>
            <div className="text-sm text-gray-500">Measurements Recorded</div>
          </div>
        </CardContent>
      </Card>

      {/* Add Measurement Form */}
      <AnimatePresence>
        {isAddingMeasurement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Measurement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newMeasurement.name}
                      onChange={(e) => setNewMeasurement(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Temperature"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newMeasurement.value}
                      onChange={(e) => setNewMeasurement(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g., 25.5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newMeasurement.unit}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., °C, mL, pH"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={newMeasurement.notes}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional observations..."
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddMeasurement} className="flex-1">
                    Add Measurement
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingMeasurement(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calculator className="h-5 w-5 mr-2" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Count</div>
                <div className="text-blue-600">{stats.count}</div>
              </div>
              <div>
                <div className="font-medium">Mean</div>
                <div className="text-green-600">{stats.mean.toFixed(2)}</div>
              </div>
              <div>
                <div className="font-medium">Min</div>
                <div className="text-orange-600">{stats.min.toFixed(2)}</div>
              </div>
              <div>
                <div className="font-medium">Max</div>
                <div className="text-red-600">{stats.max.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="h-5 w-5 mr-2" />
            Measurements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No measurements recorded yet
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {measurements.map((measurement, index) => (
                <motion.div
                  key={measurement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{measurement.name}</div>
                    <div className="text-sm text-gray-600">
                      {measurement.value} {measurement.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      {measurement.timestamp.toLocaleTimeString()}
                    </div>
                    {measurement.notes && (
                      <div className="text-xs text-gray-600 mt-1">
                        {measurement.notes}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    #{index + 1}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}