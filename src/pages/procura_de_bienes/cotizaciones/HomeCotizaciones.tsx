import { useState, useEffect } from 'react';
import { Package, Upload, Bell, Award } from 'lucide-react';

export default function HomeCotizaciones() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-indigo-600 p-3 rounded-xl">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Módulo de Cotizaciones</h1>
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <h2 className="text-2xl font-semibold mb-3">Bienvenido al Portal de Proveedores</h2>
                    <p className="text-indigo-50 leading-relaxed">
                        EIGR requiere materiales y equipos para sus proyectos de construcción. A través de este módulo, 
                        puede consultar nuestros requerimientos y presentar sus cotizaciones. Nuestro equipo evaluará 
                        todas las propuestas recibidas para generar las órdenes de compra correspondientes.
                    </p>
                </div>

                {/* Instructions Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Consultar Requerimientos</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Revise los requerimientos activos de materiales y equipos para las obras de 
                                    construcción de EIGR. Cada requerimiento incluye especificaciones, cantidades y plazos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Presentar Cotizaciones</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Cargue sus cotizaciones para los bienes solicitados. Puede cotizar todos los ítems 
                                    o solo aquellos que pueda proveer según su catálogo y disponibilidad.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <Bell className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Seguimiento de Propuestas</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Monitoree el estado de sus cotizaciones. Recibirá notificaciones cuando EIGR 
                                    evalúe su propuesta y genere órdenes de compra para los ítems seleccionados.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">Órdenes de Compra</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Acceda a las órdenes de compra generadas. EIGR seleccionará los ítems de su 
                                    cotización según evaluación de precio, calidad y condiciones comerciales.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Steps */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6">Proceso de Cotización</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-1">EIGR Publica Requerimiento</h4>
                                <p className="text-slate-600 text-sm">La empresa publica los materiales y equipos necesarios para sus proyectos de construcción.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-1">Proveedores Cargan Cotizaciones</h4>
                                <p className="text-slate-600 text-sm">Múltiples proveedores presentan sus propuestas comerciales para los bienes solicitados.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-1">Evaluación de Propuestas</h4>
                                <p className="text-slate-600 text-sm">EIGR analiza y compara todas las cotizaciones recibidas según criterios técnicos y comerciales.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                                4
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-1">Generación de Orden de Compra</h4>
                                <p className="text-slate-600 text-sm">Se crea la orden de compra seleccionando los ítems más convenientes, pudiendo incluir bienes de diferentes proveedores.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Información Importante</h3>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>No es necesario cotizar todos los ítems del requerimiento, puede presentar propuestas parciales</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>EIGR evaluará todas las cotizaciones recibidas antes de tomar una decisión</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Las órdenes de compra pueden incluir ítems de múltiples proveedores según la mejor oferta</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>No todos los ítems cotizados serán necesariamente incluidos en la orden de compra</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>Mantenga sus cotizaciones actualizadas y especifique claramente condiciones de precio y entrega</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}